import { Request, Response } from 'express';
import * as divisionService from '../services/division.service';

export const getDivisiones = async (req: Request, res: Response) => {
  try {
    const divisiones = await divisionService.obtenerDivisiones();
    res.status(200).json(divisiones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las divisiones' });
  }
};

export const createDivision = async (req: Request, res: Response) => {
  try {
    const { nombre_division, abreviatura, id_departamento } = req.body;
    if (!nombre_division || !abreviatura || !id_departamento) {
       res.status(400).json({ error: 'Faltan campos obligatorios' });
       return;
    }
    const nueva = await divisionService.crearDivision(nombre_division, abreviatura, id_departamento);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la division' });
  }
};

export const updateDivision = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'ID no válido' }); return; }
    const actualizada = await divisionService.actualizarDivision(id, req.body);
    res.status(200).json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

export const softDeleteDivision = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'ID no válido' }); return; }
    const deBaja = await divisionService.bajaLogicaDivision(id);
    res.status(200).json({ mensaje: 'Baja exitosa', division: deBaja });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de baja' });
  }
};