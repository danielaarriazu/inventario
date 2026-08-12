import { Request, Response } from 'express';
import * as cargoService from '../services/cargo.service';

// GET /api/cargo/encabezado -> cualquier autenticado (lo necesita la vista de impresión)
export const getEncabezado = async (req: Request, res: Response) => {
  try {
    const encabezado = await cargoService.obtenerEncabezado(req.usuario!.id_cargo);
    res.status(200).json(encabezado);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al obtener el encabezado' });
  }
};

// PUT /api/cargo/encabezado -> solo el Responsable lo puede configurar
export const updateEncabezado = async (req: Request, res: Response) => {
  try {
    const { encabezado_linea1, encabezado_destino, encabezado_linea3, encabezado_titulo, encabezado_anio } = req.body;
    if (!encabezado_linea1 || !encabezado_destino || !encabezado_linea3 || !encabezado_titulo || !encabezado_anio) {
      res.status(400).json({ error: 'Completá las 5 líneas del encabezado' });
      return;
    }
    const actualizado = await cargoService.actualizarEncabezado(
      req.usuario!.id_cargo,
      encabezado_linea1,
      encabezado_destino,
      encabezado_linea3,
      encabezado_titulo,
      encabezado_anio
    );
    res.status(200).json(actualizado);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al actualizar el encabezado' });
  }
};