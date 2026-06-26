import prisma from '../config/db';
import QRCode from 'qrcode';

export const obtenerEquipos = async () => {
  return await prisma.planilla_Equipo.findMany({
    where: { 
      NOT: { estado_equipo: 'BAJA' } 
    },
    include: {
      division: {
        include: {
          departamento: {
            include: { destino: true }
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
      division: {
        include: {
          departamento: {
            include: { destino: true }
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
  usuario_modificador: string = "Sistema" // En el futuro acá vendrá el usuario logueado
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
        motivo_cambio: `Actualización de datos por ${usuario_modificador}`,
        detalle_cambios: JSON.stringify(cambiosRealizados)
      }
    });

    return equipoActualizado;
  });

  return resultado;
};

export const bajaLogicaEquipo = async (id_planilla: number) => {
  return await prisma.planilla_Equipo.update({
    where: { id_planilla },
    data: { estado_equipo: 'BAJA' }
  });
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