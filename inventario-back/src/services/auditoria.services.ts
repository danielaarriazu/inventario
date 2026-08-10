import prisma from '../config/db';

export const obtenerHistorialCompleto = async (id_cargo: number) => {
  return await prisma.historial_Modificacion.findMany({
    where: {
      planilla: {
        oficina: {
          division: {
            departamento: {
              destino: { id_cargo }
            }
          }
        }
      }
    },
    orderBy: { fecha_modificacion: 'desc' },
    include: {
      // Traemos un par de datos del equipo para que la tabla sea legible
      planilla: {
        select: {
          numero_equipo: true,
          nombre_equipo: true,
          usuario_responsable: true
        }
      },
      usuario: {
        select: {
          nombre_apellido: true,
          mr: true
        }
      },
      oficina_destino: {
        select: {
          numero_oficina: true
        }
      }
    }
  });
};

export const obtenerHistorialPorEquipo = async (id_planilla: number) => {
  return await prisma.historial_Modificacion.findMany({
    where: { id_planilla },
    orderBy: { fecha_modificacion: 'desc' },
    include: {
      usuario: {
        select: {
          nombre_apellido: true,
          mr: true
        }
      },
      oficina_destino: {
        select: {
          numero_oficina: true
        }
      }
    }
  });
};

export const registrarCambio = async (
  id_planilla: number,
  motivo_cambio: string,
  detalle_cambios: string,
  id_usuario?: number,
  tipo_accion?: string,
  id_oficina_destino?: number,
  observaciones?: string
) => {
  return await prisma.historial_Modificacion.create({
    data: {
      id_planilla,
      id_usuario,
      tipo_accion: tipo_accion as any,
      id_oficina_destino,
      observaciones,
      motivo_cambio,
      detalle_cambios // Acá vamos a recibir el JSON convertido a texto (string)
    }
  });
};