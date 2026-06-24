import prisma from '../config/db';

export const obtenerHistorialCompleto = async () => {
  return await prisma.historial_Modificacion.findMany({
    orderBy: { fecha_modificacion: 'desc' },
    include: {
      // Traemos un par de datos del equipo para que la tabla sea legible
      planilla: {
        select: {
          numero_equipo: true,
          nombre_equipo: true,
          usuario_responsable: true
        }
      }
    }
  });
};

export const obtenerHistorialPorEquipo = async (id_planilla: number) => {
  return await prisma.historial_Modificacion.findMany({
    where: { id_planilla },
    orderBy: { fecha_modificacion: 'desc' }
  });
};

export const registrarCambio = async (id_planilla: number, motivo_cambio: string, detalle_cambios: string) => {
  return await prisma.historial_Modificacion.create({
    data: {
      id_planilla,
      motivo_cambio,
      detalle_cambios // Acá vamos a recibir el JSON convertido a texto (string)
    }
  });
};