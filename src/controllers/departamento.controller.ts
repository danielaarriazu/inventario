import { Request, Response } from 'express';
import * as departamentoService from '../services/departamento.service';

export const getDepartamentos = async (req: Request, res: Response) => {
  try {
    const departamentos = await departamentoService.obtenerDepartamentos();
    res.status(200).json(departamentos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los departamentos' });
  }
};

export const createDepartamento = async (req: Request, res: Response) => {
  try {
    const { nombre_departamento, abreviatura, id_destino } = req.body;
    if (!nombre_departamento || !abreviatura || !id_destino) {
       res.status(400).json({ error: 'Faltan campos obligatorios' });
       return;
    }
    const nuevo = await departamentoService.crearDepartamento(nombre_departamento, abreviatura, id_destino);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el departamento' });
  }
};

export const updateDepartamento = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'ID no válido' }); return; }
    const actualizado = await departamentoService.actualizarDepartamento(id, req.body);
    res.status(200).json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

export const softDeleteDepartamento = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'ID no válido' }); return; }
    const deBaja = await departamentoService.bajaLogicaDepartamento(id);
    res.status(200).json({ mensaje: 'Baja exitosa', departamento: deBaja });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de baja' });
  }
};