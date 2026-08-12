import prisma from '../config/db';

export const obtenerEncabezado = async (id_cargo: number) => {
  const cargo = await prisma.cargo.findUnique({
    where: { id_cargo },
    select: {
      encabezado_linea1: true,
      encabezado_destino: true,
      encabezado_linea3: true,
      encabezado_titulo: true,
      encabezado_anio: true
    }
  });
  if (!cargo) throw new Error('Cargo no encontrado');
  return cargo;
};

export const actualizarEncabezado = async (
  id_cargo: number,
  encabezado_linea1: string,
  encabezado_destino: string,
  encabezado_linea3: string,
  encabezado_titulo: string,
  encabezado_anio: string
) => {
  return await prisma.cargo.update({
    where: { id_cargo },
    data: { encabezado_linea1, encabezado_destino, encabezado_linea3, encabezado_titulo, encabezado_anio }
  });
};