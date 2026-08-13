import prisma from '../config/db';
import { obtenerConteosPorNivel } from './equipo.service';

export const obtenerDepartamentos = async (id_cargo: number, id_destino?: number) => {
  const departamentos = await prisma.departamento.findMany({
    where: {
      estado: 'ALTA',
      ...(id_destino ? { id_destino } : {})
    },
    include: { destino: true }
  });
  const { porDepartamento } = await obtenerConteosPorNivel(id_cargo);
  return departamentos.map(d => ({ ...d, cantidad_equipos: porDepartamento[d.id_departamento] || 0 }));
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