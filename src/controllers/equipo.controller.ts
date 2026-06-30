import { Request, Response } from 'express';
import * as equipoService from '../services/equipo.service';

export const getEquipos = async (req: Request, res: Response) => {
  try {
    const id_cargo = req.usuario!.id_cargo;
    const equipos = await equipoService.obtenerEquipos(id_cargo);
    res.status(200).json(equipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la planilla de equipos' });
  }
};

export const createEquipo = async (req: Request, res: Response) => {
  try {
    // Como son muchos datos, le pasamos el body completo al servicio
    // Prisma se encarga de validar que los campos y Enums sean correctos
    const nuevoEquipo = await equipoService.crearEquipo(req.body);
    res.status(201).json(nuevoEquipo);
  } catch (error) {
    console.error(error); // Útil para ver en consola si falta algún dato obligatorio
    res.status(500).json({ error: 'Error al registrar el equipo. Verifique los datos enviados.' });
  }
};

export const updateEquipo = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { 
      res.status(400).json({ error: 'El ID proporcionado no es válido' }); 
      return; 
    }
    const equipoActualizado = await equipoService.actualizarEquipo(id, req.body);
    res.status(200).json(equipoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar los datos del equipo' });
  }
};

export const softDeleteEquipo = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { 
      res.status(400).json({ error: 'El ID proporcionado no es válido' }); 
      return; 
    }
    const equipoDeBaja = await equipoService.bajaLogicaEquipo(id);
    res.status(200).json({ mensaje: 'Equipo dado de baja exitosamente', equipo: equipoDeBaja });
  } catch (error) {
    res.status(500).json({ error: 'Error al intentar dar de baja el equipo' });
  }
};