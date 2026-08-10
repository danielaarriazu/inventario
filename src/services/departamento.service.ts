import prisma from '../config/db';

export const obtenerDepartamentos = async (id_destino?: number) => {
  return await prisma.departamento.findMany({
    where: {
      estado: 'ALTA',
      ...(id_destino ? { id_destino } : {})
    },
    include: { destino: true }
  });
};

export const crearDepartamento = async (nombre_departamento: string, abreviatura: string, id_destino: number) => {
  return await prisma.departamento.create({
    data: { nombre_departamento, abreviatura, id_destino }
  });
};

export const actualizarDepartamento = async (id_departamento: number, data: any) => {
  return await prisma.departamento.update({
    where: { id_departamento },
    data
  });
};

export const bajaLogicaDepartamento = async (id_departamento: number) => {
  return await prisma.departamento.update({
    where: { id_departamento },
    data: { estado: 'BAJA' }
  });
};