import prisma from '../config/db';

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

export const crearEquipo = async (data: any) => {
  return await prisma.planilla_Equipo.create({
    data
  });
};

export const actualizarEquipo = async (id_planilla: number, data: any) => {
  return await prisma.planilla_Equipo.update({
    where: { id_planilla },
    data
  });
};

export const bajaLogicaEquipo = async (id_planilla: number) => {
  return await prisma.planilla_Equipo.update({
    where: { id_planilla },
    data: { estado_equipo: 'BAJA' }
  });
};