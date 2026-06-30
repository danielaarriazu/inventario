import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const registrarCargo = async (req: Request, res: Response) => {
  try {
    const { nombre_cargo, jerarquia, nombre_apellido, mr, password } = req.body;

    if (!nombre_cargo || !jerarquia || !nombre_apellido || !mr || !password) {
      res.status(400).json({ error: 'Faltan datos obligatorios para crear el Cargo' });
      return;
    }

    const nuevoSistema = await authService.crearCargoYAdmin(nombre_cargo, jerarquia, nombre_apellido, mr, password);
    res.status(201).json({ mensaje: 'Cargo y Administrador creados exitosamente' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { mr, password } = req.body;

    if (!mr || !password) {
      res.status(400).json({ error: 'Debe ingresar matrícula y contraseña' });
      return;
    }

    const sesion = await authService.iniciarSesion(mr, password);
    res.status(200).json(sesion);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};