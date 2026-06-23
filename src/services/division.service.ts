import prisma from '../config/db';

export const obtenerDivisiones = async () => {
  return await prisma.division.findMany({
    where: { estado: 'ALTA' },
    include: { departamento: true }
  });
};

export const crearDivision = async (nombre_division: string, abreviatura: string, id_departamento: number) => {
  return await prisma.division.create({
    data: { nombre_division, abreviatura, id_departamento }
  });
};

export const actualizarDivision = async (id_division: number, data: any) => {
  return await prisma.division.update({
    where: { id_division },
    data
  });
};

export const bajaLogicaDivision = async (id_division: number) => {
  return await prisma.division.update({
    where: { id_division },
    data: { estado: 'BAJA' }
  });
};