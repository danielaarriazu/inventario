import { Request, Response } from 'express';
import * as oficinaService from '../services/oficina.service';

export const getOficinas = async (req: Request, res: Response) => {
  try {
    const oficinas = await oficinaService.obtenerOficinas();
    res.status(200).json(oficinas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las oficinas' });
  }
};

export const createOficina = async (req: Request, res: Response) => {
  try {
    const { numero_oficina, id_division } = req.body;
    if (!numero_oficina || !id_division) {
       res.status(400).json({ error: 'Faltan campos obligatorios' });
       return;
    }
    const nueva = await oficinaService.crearOficina(numero_oficina, id_division);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la oficina' });
  }
};

export const updateOficina = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'ID no válido' }); return; }
    const actualizada = await oficinaService.actualizarOficina(id, req.body);
    res.status(200).json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

export const softDeleteOficina = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'ID no válido' }); return; }
    const deBaja = await oficinaService.bajaLogicaOficina(id);
    res.status(200).json({ mensaje: 'Baja exitosa', oficina: deBaja });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de baja' });
  }
};