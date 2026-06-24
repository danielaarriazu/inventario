import { Request, Response } from 'express';
import * as auditoriaService from '../services/auditoria.services';

export const getHistorial = async (req: Request, res: Response) => {
  try {
    const historial = await auditoriaService.obtenerHistorialCompleto();
    res.status(200).json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los registros de auditoría' });
  }
};

export const getHistorialByEquipo = async (req: Request, res: Response) => {
  try {
    const idPlanilla = parseInt(req.params.id as string, 10);
    if (isNaN(idPlanilla)) {
      res.status(400).json({ error: 'El ID de la planilla no es válido' });
      return;
    }

    const historial = await auditoriaService.obtenerHistorialPorEquipo(idPlanilla);
    res.status(200).json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial del equipo' });
  }
};

export const createRegistroAuditoria = async (req: Request, res: Response) => {
  try {
    const { id_planilla, motivo_cambio, detalle_cambios } = req.body;

    if (!id_planilla || !motivo_cambio || !detalle_cambios) {
      res.status(400).json({ error: 'Faltan campos obligatorios para registrar la auditoría' });
      return;
    }

    // Un truquito: si desde el frontend te mandan un objeto JSON literal en detalle_cambios, 
    // lo convertimos a string (texto) automáticamente para que Prisma lo guarde bien.
    const detalleString = typeof detalle_cambios === 'object' 
      ? JSON.stringify(detalle_cambios) 
      : detalle_cambios;

    const nuevoRegistro = await auditoriaService.registrarCambio(id_planilla, motivo_cambio, detalleString);
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el cambio en la auditoría' });
  }
};