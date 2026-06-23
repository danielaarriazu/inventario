import prisma from '../config/db';

export const obtenerTodosLosDestinos = async () => {
  return await prisma.destino.findMany({
    where: { estado: 'ALTA' }
  });
};


export const crearNuevoDestino = async (cod_destino: number, nombre_destino: string, descripcion?: string) => {
  return await prisma.destino.create({
    data: {
      cod_destino,
      nombre_destino,
      descripcion
    }
  });
};

export const actualizarDestino = async (id_destino: number, data: { cod_destino?: number; nombre_destino?: string; descripcion?: string }) => {
  return await prisma.destino.update({
    where: { id_destino },
    data
  });
};


export const bajaLogicaDestino = async (id_destino: number) => {
  return await prisma.destino.update({
    where: { id_destino },
    data: { estado: 'BAJA' }
  });
};