import { Request, Response } from 'express';
import * as equipoService from '../services/equipo.service';

export const getEquipos = async (req: Request, res: Response) => {
  try {
    const id_cargo = req.usuario!.id_cargo;
    const id_oficina = req.query.id_oficina ? parseInt(req.query.id_oficina as string, 10) : undefined;
    const equipos = await equipoService.obtenerEquipos(id_cargo, id_oficina);
    res.status(200).json(equipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la planilla de equipos' });
  }
};

export const getEquipoById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { 
      res.status(400).json({ error: 'El ID proporcionado no es válido' }); 
      return; 
    }
    
    const equipo = await equipoService.obtenerEquipoPorId(id);
    
    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }
    
    res.status(200).json(equipo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos del equipo' });
  }
};

export const createEquipo = async (req: Request, res: Response) => {
  try {
    const id_cargo = req.usuario!.id_cargo;
    const nuevoEquipo = await equipoService.crearEquipo(req.body, id_cargo);
    res.status(201).json(nuevoEquipo);
  } catch (error: any) {
    console.error(error); 
    res.status(400).json({ error: error.message || 'Error al registrar el equipo. Verifique los datos enviados.' });
  }
};

export const updateEquipo = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { 
      res.status(400).json({ error: 'El ID proporcionado no es válido' }); 
      return; 
    }
    const equipoActualizado = await equipoService.actualizarEquipo(id, req.body, req.usuario!.id_usuario);
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
    const equipoDeBaja = await equipoService.bajaLogicaEquipo(id, req.usuario!.id_usuario);
    res.status(200).json({ mensaje: 'Equipo dado de baja exitosamente', equipo: equipoDeBaja });
  } catch (error) {
    res.status(500).json({ error: 'Error al intentar dar de baja el equipo' });
  }
};

export const getEquipoQR = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { 
      res.status(400).json({ error: 'El ID proporcionado no es válido' }); 
      return; 
    }
    
    const qrCodeImage = await equipoService.generarQrEquipo(id);
    
    res.status(200).json({ 
      mensaje: 'QR generado exitosamente',
      qr_image: qrCodeImage 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar el código QR' });
  }
};

// POST /api/equipos/:id/movimiento -> usado desde la pantalla de Movimientos
export const registrarMovimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_planilla = parseInt(req.params.id as string, 10);
    if (isNaN(id_planilla)) {
      res.status(400).json({ error: 'El ID proporcionado no es válido' });
      return;
    }

    const { tipo_accion, id_oficina_destino, observaciones, cambios } = req.body;
    const id_usuario = req.usuario!.id_usuario;

    if (!tipo_accion) {
      res.status(400).json({ error: 'El tipo de acción es obligatorio' });
      return;
    }

    const resultado = await equipoService.registrarMovimiento(
      id_planilla,
      tipo_accion,
      id_usuario,
      id_oficina_destino,
      observaciones,
      cambios
    );
    res.status(201).json(resultado);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al registrar el movimiento' });
  }
};

// PUT /api/equipos/:id/en-reparacion -> lo marca fuera de servicio (se lo llevaron al taller)
export const marcarEnReparacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_planilla = parseInt(req.params.id as string, 10);
    if (isNaN(id_planilla)) {
      res.status(400).json({ error: 'El ID proporcionado no es válido' });
      return;
    }
    const resultado = await equipoService.marcarEnReparacion(id_planilla, req.usuario!.id_usuario);
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al marcar el equipo en reparación' });
  }
};