import { Request, Response } from 'express';
import * as auditoriaService from '../services/auditoria.services';

export const getHistorial = async (req: Request, res: Response) => {
  try {
    const id_cargo = req.usuario!.id_cargo;
    const historial = await auditoriaService.obtenerHistorialCompleto(id_cargo);
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
    const { id_planilla, motivo_cambio, detalle_cambios, tipo_accion, id_oficina_destino, observaciones } = req.body;
    // El usuario que hizo el movimiento sale del token, nunca del body
    const id_usuario = req.usuario!.id_usuario;

    if (!id_planilla || !motivo_cambio || !detalle_cambios) {
      res.status(400).json({ error: 'Faltan campos obligatorios para registrar la auditoría' });
      return;
    }

    const detalleString = typeof detalle_cambios === 'object'
      ? JSON.stringify(detalle_cambios)
      : detalle_cambios;

    const nuevoRegistro = await auditoriaService.registrarCambio(
      id_planilla,
      motivo_cambio,
      detalleString,
      id_usuario,
      tipo_accion,
      id_oficina_destino,
      observaciones
    );
    res.status(201).json(nuevoRegistro);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el cambio en la auditoría' });
  }
};