import prisma from '../config/db';
import QRCode from 'qrcode';

export const obtenerEquipos = async (id_cargo: number) => {
  return await prisma.planilla_Equipo.findMany({
    where: {
      // Magia de Prisma: Buscamos solo los equipos cuyo destino pertenezca a este cargo
      oficina: {
        division: {
          departamento: {
            destino: {
              id_cargo: id_cargo
            }
          }
        }
      }
    },
    include: {
      oficina: {
        include: {
          division: {
            include: {
              departamento: {
                include: { destino: true }
              }
            }
          }
        }
      }
    }
  });
};
export const obtenerEquipoPorId = async (id_planilla: number) => {
  return await prisma.planilla_Equipo.findUnique({
    where: { id_planilla },
    include: {
      oficina: {
        include: {
          division: {
            include: {
              departamento: {
                include: { destino: true }
              }
            }
          }
        }
      }
    }
  });
};

const CODIGO_DOMINIO: Record<string, string> = {
  RINA: 'R',
  INTERNET_ARA: 'A',
  INTERNET: 'I',
  SIN_CONEXION: 'S'
};

export const crearEquipo = async (data: any, id_cargo: number) => {
  const oficina = await prisma.oficina.findUnique({ where: { id_oficina: data.id_oficina } });
  if (!oficina) {
    throw new Error('La oficina seleccionada no existe');
  }

  const codigoDominio = CODIGO_DOMINIO[data.dominio_conexion];
  if (!codigoDominio) {
    throw new Error('Dominio de conexión no válido');
  }

  const cantidadExistente = await prisma.planilla_Equipo.count({
    where: {
      dominio_conexion: data.dominio_conexion,
      oficina: {
        division: {
          departamento: {
            destino: { id_cargo }
          }
        }
      }
    }
  });

  const correlativo = cantidadExistente + 1;
  const nombreGenerado = `${oficina.numero_oficina}.${codigoDominio}${correlativo}`;

  return await prisma.planilla_Equipo.create({
    data: {
      ...data,
      nombre_equipo: nombreGenerado,
      correlativo_dominio: correlativo
    }
  });
};

export const actualizarEquipo = async (
  id_planilla: number, 
  data: any, 
  id_usuario?: number // Usuario autenticado que hace el cambio (viene del token)
) => {
  // Estos dos campos solo pueden cambiar mediante un Traspaso (Movimientos),
  // nunca desde una edición común de la Ficha
  const { nombre_equipo, usuario_responsable, ...data2 } = data;
  data = data2;

  const equipoViejo = await prisma.planilla_Equipo.findUnique({
    where: { id_planilla }
  });

  if (!equipoViejo) {
    throw new Error('Equipo no encontrado');
  }

  const cambiosRealizados: any = {};
  for (const key in data) {
    if (data[key] !== (equipoViejo as any)[key]) {
      cambiosRealizados[key] = {
        antes: (equipoViejo as any)[key],
        despues: data[key]
      };
    }
  }

  if (Object.keys(cambiosRealizados).length === 0) {
    return equipoViejo;
  }

  const resultado = await prisma.$transaction(async (tx) => {
    
    const equipoActualizado = await tx.planilla_Equipo.update({
      where: { id_planilla },
      data
    });

    await tx.historial_Modificacion.create({
      data: {
        id_planilla,
        id_usuario,
        motivo_cambio: 'Actualización de datos',
        detalle_cambios: JSON.stringify(cambiosRealizados)
      }
    });

    return equipoActualizado;
  });

  return resultado;
};

export const bajaLogicaEquipo = async (id_planilla: number, id_usuario?: number) => {
  const equipoViejo = await prisma.planilla_Equipo.findUnique({
    where: { id_planilla },
    select: { estado_equipo: true }
  });

  if (!equipoViejo) {
    throw new Error('Equipo no encontrado');
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const equipoDeBaja = await tx.planilla_Equipo.update({
      where: { id_planilla },
      data: { estado_equipo: 'BAJA' }
    });

    await tx.historial_Modificacion.create({
      data: {
        id_planilla,
        id_usuario,
        tipo_accion: 'BAJA_DEFINITIVA',
        motivo_cambio: 'Baja definitiva del equipo',
        detalle_cambios: JSON.stringify({
          estado_equipo: { antes: equipoViejo.estado_equipo, despues: 'BAJA' }
        })
      }
    });

    return equipoDeBaja;
  });

  return resultado;
};
const ETIQUETAS_TIPO_ACCION: Record<string, string> = {
  TRASPASO: 'Traspaso de equipo',
  MANTENIMIENTO_PREVENTIVO: 'Mantenimiento preventivo',
  REPARACION: 'Reparación',
  BAJA_DEFINITIVA: 'Baja definitiva'
};

// Usado desde la pantalla de Movimientos: además de dejar el registro en el
// historial, actualiza el propio equipo cuando el tipo de acción lo requiere
// (Traspaso mueve la oficina real, Baja Definitiva marca el estado, y una
// Reparación puede venir con cambios de componentes técnicos para sincronizar
// la planilla de consignación)
export const registrarMovimiento = async (
  id_planilla: number,
  tipo_accion: string,
  id_usuario: number,
  id_oficina_destino?: number,
  observaciones?: string,
  cambiosEquipo?: Record<string, any>
) => {
  const equipoViejo = await prisma.planilla_Equipo.findUnique({
    where: { id_planilla }
  });

  if (!equipoViejo) {
    throw new Error('Equipo no encontrado');
  }

  if (!ETIQUETAS_TIPO_ACCION[tipo_accion]) {
    throw new Error('Tipo de acción no válido');
  }

  if (tipo_accion === 'TRASPASO' && !id_oficina_destino) {
    throw new Error('El traspaso requiere una oficina destino');
  }

  const dataEquipo: any = {};
  const detalleCambios: any = {};

  if (tipo_accion === 'TRASPASO') {
    dataEquipo.id_oficina = id_oficina_destino;
    detalleCambios.id_oficina = { antes: equipoViejo.id_oficina, despues: id_oficina_destino };

    // El nombre de PC arranca con la oficina (ej: "13-71.I11") — al traspasar
    // se regenera esa parte con la oficina nueva, conservando el sufijo de
    // dominio+correlativo que no cambió
    const oficinaNueva = await prisma.oficina.findUnique({ where: { id_oficina: id_oficina_destino } });
    if (oficinaNueva) {
      const partes = equipoViejo.nombre_equipo.split('.');
      const sufijo = partes.length > 1 ? partes[partes.length - 1] : '';
      const nombreNuevo = sufijo ? `${oficinaNueva.numero_oficina}.${sufijo}` : oficinaNueva.numero_oficina;
      if (nombreNuevo !== equipoViejo.nombre_equipo) {
        dataEquipo.nombre_equipo = nombreNuevo;
        detalleCambios.nombre_equipo = { antes: equipoViejo.nombre_equipo, despues: nombreNuevo };
      }
    }
  } else if (tipo_accion === 'BAJA_DEFINITIVA') {
    dataEquipo.estado_equipo = 'BAJA';
    detalleCambios.estado_equipo = { antes: equipoViejo.estado_equipo, despues: 'BAJA' };
  }

  // Si vino algún cambio de componente (típicamente en una Reparación: se
  // cambió la RAM, el disco, etc.), lo aplicamos a la planilla real y
  // dejamos el antes/después asentado en el historial junto con todo lo demás
  if (cambiosEquipo) {
    for (const campo in cambiosEquipo) {
      const valorNuevo = cambiosEquipo[campo];
      const valorViejo = (equipoViejo as any)[campo];
      if (valorNuevo !== valorViejo) {
        dataEquipo[campo] = valorNuevo;
        detalleCambios[campo] = { antes: valorViejo, despues: valorNuevo };
      }
    }
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const equipoActualizado = Object.keys(dataEquipo).length > 0
      ? await tx.planilla_Equipo.update({ where: { id_planilla }, data: dataEquipo })
      : equipoViejo;

    const historial = await tx.historial_Modificacion.create({
      data: {
        id_planilla,
        id_usuario,
        tipo_accion: tipo_accion as any,
        id_oficina_destino: tipo_accion === 'TRASPASO' ? id_oficina_destino : undefined,
        observaciones,
        motivo_cambio: ETIQUETAS_TIPO_ACCION[tipo_accion],
        detalle_cambios: JSON.stringify(detalleCambios)
      }
    });

    return { equipo: equipoActualizado, historial };
  });

  return resultado;
};

export const generarQrEquipo = async (id_planilla: number) => {
  // Primero verificamos que la PC exista
  const equipo = await prisma.planilla_Equipo.findUnique({
    where: { id_planilla },
    select: { numero_equipo: true } // Solo traemos el número para armar la URL
  });

  if (!equipo) {
    throw new Error('Equipo no encontrado');
  }

  const frontendUrl = (process.env.FRONTEND_URL || 'https://inventario-wju6.onrender.com').replace(/\/$/, '');
  const urlDestino = `${frontendUrl}/equipos/${id_planilla}`;

  const qrBase64 = await QRCode.toDataURL(urlDestino, {
    margin: 1,
    width: 300
  });

  return qrBase64;
};