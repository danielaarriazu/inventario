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

export const crearEquipo = async (data: any) => {
  return await prisma.planilla_Equipo.create({
    data
  });
};

export const actualizarEquipo = async (
  id_planilla: number, 
  data: any, 
  id_usuario?: number // Usuario autenticado que hace el cambio (viene del token)
) => {
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
// (Traspaso mueve la oficina real, Baja Definitiva marca el estado)
export const registrarMovimiento = async (
  id_planilla: number,
  tipo_accion: string,
  id_usuario: number,
  id_oficina_destino?: number,
  observaciones?: string
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
  } else if (tipo_accion === 'BAJA_DEFINITIVA') {
    dataEquipo.estado_equipo = 'BAJA';
    detalleCambios.estado_equipo = { antes: equipoViejo.estado_equipo, despues: 'BAJA' };
  }
  // REPARACION y MANTENIMIENTO_PREVENTIVO no modifican el equipo en sí,
  // solo quedan registrados en el historial

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

  // Por ahora ponemos una URL de ejemplo, cuando tengas tu frontend la cambiamos.
  const urlDestino = `https://inventario-armada.com/equipos/ficha/${id_planilla}`;

  const qrBase64 = await QRCode.toDataURL(urlDestino, {
    margin: 1,
    width: 300
  });

  return qrBase64;
};