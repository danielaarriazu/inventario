import prisma from '../config/db';

export const obtenerOficinas = async (id_division?: number) => {
  return await prisma.oficina.findMany({
    where: {
      estado: 'ALTA',
      ...(id_division ? { id_division } : {})
    },
    include: { division: true }
  });
};

export const crearOficina = async (numero_oficina: string, id_division: number) => {
  return await prisma.oficina.create({
    data: { numero_oficina, id_division }
  });
};

export const actualizarOficina = async (id_oficina: number, data: any) => {
  return await prisma.oficina.update({
    where: { id_oficina },
    data
  });
};

export const bajaLogicaOficina = async (id_oficina: number) => {
  return await prisma.oficina.update({
    where: { id_oficina },
    data: { estado: 'BAJA' }
  });
};