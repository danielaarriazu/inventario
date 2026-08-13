import prisma from '../config/db';
import { obtenerConteosPorNivel } from './equipo.service';

export const obtenerDivisiones = async (id_cargo: number, id_departamento?: number) => {
  const divisiones = await prisma.division.findMany({
    where: {
      estado: 'ALTA',
      ...(id_departamento ? { id_departamento } : {})
    },
    include: { departamento: true }
  });
  const { porDivision } = await obtenerConteosPorNivel(id_cargo);
  return divisiones.map(d => ({ ...d, cantidad_equipos: porDivision[d.id_division] || 0 }));
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