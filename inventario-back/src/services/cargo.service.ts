import prisma from '../config/db';

export const obtenerEncabezado = async (id_cargo: number) => {
  const cargo = await prisma.cargo.findUnique({
    where: { id_cargo },
    select: { encabezado_destino: true, encabezado_anio: true }
  });
  if (!cargo) throw new Error('Cargo no encontrado');
  return cargo;
};

export const actualizarEncabezado = async (id_cargo: number, encabezado_destino: string, encabezado_anio: string) => {
  return await prisma.cargo.update({
    where: { id_cargo },
    data: { encabezado_destino, encabezado_anio }
  });
};