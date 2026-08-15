import { Request, Response } from 'express';
import * as equipoService from '../services/equipo.service';
import * as auditoriaService from '../services/auditoria.services';
import * as cargoService from '../services/cargo.service';

// GET /api/publico/equipos/:id -> sin login. Trae el equipo, su historial y
// el encabezado de la planilla, todo junto, para la vista pública que se
// abre al escanear el QR. Ver e imprimir únicamente, nunca modificar.
export const getFichaPublica = async (req: Request, res: Response) => {
  try {
    const id_planilla = parseInt(req.params.id as string, 10);
    if (isNaN(id_planilla)) {
      res.status(400).json({ error: 'El ID proporcionado no es válido' });
      return;
    }

    const equipo = await equipoService.obtenerEquipoPorId(id_planilla);
    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    const id_cargo = (equipo as any).oficina.division.departamento.destino.id_cargo;
    const [historial, encabezado] = await Promise.all([
      auditoriaService.obtenerHistorialPorEquipo(id_planilla),
      cargoService.obtenerEncabezado(id_cargo)
    ]);

    res.status(200).json({ equipo, historial, encabezado });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la ficha' });
  }
};

// GET /api/publico/equipos/:id/qr -> el QR en sí, por si desde la vista
// pública también quieren volver a descargarlo/imprimirlo
export const getQrPublico = async (req: Request, res: Response) => {
  try {
    const id_planilla = parseInt(req.params.id as string, 10);
    if (isNaN(id_planilla)) {
      res.status(400).json({ error: 'El ID proporcionado no es válido' });
      return;
    }
    const qr_image = await equipoService.generarQrEquipo(id_planilla);
    res.status(200).json({ qr_image });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al generar el QR' });
  }
};