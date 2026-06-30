import { Request, Response } from 'express';
import * as destinoService from '../services/destino.service';

export const getDestinos = async (req: Request, res: Response) => {
  try {
    const id_cargo = req.usuario!.id_cargo;
    const destinos = await destinoService.obtenerTodosLosDestinos(id_cargo);
    res.status(200).json(destinos);
  } catch (error) {
    console.error("🚨 ERROR REAL EN GET DESTINOS:", error);
    res.status(500).json({ error: 'Error interno al obtener los destinos' });
  }
};

export const createDestino = async (req: Request, res: Response) => {
  try {
    const { cod_destino, nombre_destino, descripcion } = req.body;
    
    if (!cod_destino || !nombre_destino) {
       res.status(400).json({ error: 'El código y el nombre del destino son obligatorios' });
       return;
    }

    const nuevoDestino = await destinoService.crearNuevoDestino(cod_destino, nombre_destino, descripcion);
    res.status(201).json(nuevoDestino);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el destino. Verifique que el código no esté repetido.' });
  }
};

export const updateDestino = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'El ID proporcionado no es válido' });
      return;
    }

    const destinoActualizado = await destinoService.actualizarDestino(id, req.body);
    res.status(200).json(destinoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el destino. Verifique que el destino exista.' });
  }
};

export const softDeleteDestino = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'El ID proporcionado no es válido' });
      return;
    }

    const destinoDeBaja = await destinoService.bajaLogicaDestino(id);
    res.status(200).json({ 
      mensaje: 'Destino dado de baja exitosamente', 
      destino: destinoDeBaja 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al intentar dar de baja el destino.' });
  }
};