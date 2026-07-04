import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import prisma from '../config/db';
import * as bcrypt from 'bcrypt';

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
export const registrarAuxiliar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mr, nombre, rol, jerarquia } = req.body;
    // req.user viene del authMiddleware con los datos descifrados del JWT
    const id_cargo = (req as any).user.id_cargo; 

    if (!mr || !nombre || !rol) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    // Verificamos si la matrícula ya está registrada
    const existeUsuario = await prisma.usuario.findUnique({ where: { mr } });
    if (existeUsuario) {
      res.status(400).json({ error: 'La matrícula (MR) ya se encuentra registrada' });
      return;
    }

    // Le asignamos una contraseña por defecto (ej: la misma matrícula o "123456") 
    // encriptada para que puedan iniciar sesión
    const passwordHasheada = await bcrypt.hash(mr, 10);

    const nuevoAuxiliar = await prisma.usuario.create({
      data: {
        mr,
        nombre_apellido: nombre,
        password: passwordHasheada,
        rol, // OPERADOR, AUDITOR, ENCARGADO, etc.
        jerarquia,
        id_cargo // Se vincula automáticamente a tu misma jurisdicción
      }
    });

    res.status(201).json(nuevoAuxiliar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al registrar el auxiliar' });
  }
};

export const obtenerAuxiliares = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_cargo = (req as any).user.id_cargo;

    // Buscamos todos los usuarios que pertenezcan al mismo Cargo/Jurisdicción
    const auxiliares = await prisma.usuario.findMany({
      where: {
        id_cargo: id_cargo
      },
      select: {
        id_usuario: true,
        mr: true,
        nombre: true,
        rol: true
      }
    });

    res.json(auxiliares);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al obtener el equipo' });
  }
};