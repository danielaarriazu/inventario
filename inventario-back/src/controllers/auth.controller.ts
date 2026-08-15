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
    const { mr, nombre, rol, jerarquia, password } = req.body;
    // req.usuario viene del middleware verificarToken con los datos descifrados del JWT
    const id_cargo = req.usuario!.id_cargo;

    if (!mr || !nombre || !rol || !password) {
      res.status(400).json({ error: 'Todos los campos son obligatorios, incluida la contraseña' });
      return;
    }

    if (!/^\d+$/.test(mr)) {
      res.status(400).json({ error: 'La matrícula (MR) tiene que ser solo números' });
      return;
    }

    // Verificamos si la matrícula ya está registrada
    const existeUsuario = await prisma.usuario.findUnique({ where: { mr } });
    if (existeUsuario) {
      res.status(400).json({ error: 'La matrícula (MR) ya se encuentra registrada' });
      return;
    }

    const passwordHasheada = await bcrypt.hash(password, 10);

    const nuevoAuxiliar = await prisma.usuario.create({
      data: {
        mr,
        nombre_apellido: nombre,
        password: passwordHasheada,
        rol, // RESPONSABLE o AUXILIAR
        jerarquia,
        id_cargo // Se vincula automáticamente a tu mismo cargo
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
    const id_cargo = req.usuario!.id_cargo;

    // Buscamos todos los usuarios activos que pertenezcan al mismo Cargo
    const auxiliares = await prisma.usuario.findMany({
      where: {
        id_cargo: id_cargo,
        estado: true
      },
      select: {
        id_usuario: true,
        mr: true,
        nombre_apellido: true,
        rol: true
      }
    });

    res.json(auxiliares);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al obtener el equipo' });
  }
};

// GET /api/auth/me -> Datos del usuario logueado
export const obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_usuario = req.usuario!.id_usuario;

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: {
        id_usuario: true,
        mr: true,
        nombre_apellido: true,
        jerarquia: true,
        rol: true,
        id_cargo: true
      }
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al obtener el perfil' });
  }
};

// PUT /api/auth/me/password -> cambio mi propia contraseña (sabiendo la actual)
export const cambiarPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      res.status(400).json({ error: 'Completá la contraseña actual y la nueva' });
      return;
    }
    if (password_nueva.length < 4) {
      res.status(400).json({ error: 'La contraseña nueva es demasiado corta' });
      return;
    }

    await authService.cambiarPassword(req.usuario!.id_usuario, password_actual, password_nueva);
    res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al cambiar la contraseña' });
  }
};

// PUT /api/auth/companeros/:id/password -> el Responsable resetea la contraseña de un auxiliar
export const resetearPasswordAuxiliar = async (req: Request, res: Response): Promise<void> => {
  try {
    const idObjetivo = parseInt(req.params.id as string, 10);
    const { password_nueva } = req.body;

    if (isNaN(idObjetivo)) {
      res.status(400).json({ error: 'El ID proporcionado no es válido' });
      return;
    }
    if (!password_nueva) {
      res.status(400).json({ error: 'Ingresá la nueva contraseña' });
      return;
    }

    await authService.resetearPasswordAuxiliar(idObjetivo, req.usuario!.id_cargo, password_nueva);
    res.status(200).json({ mensaje: 'Contraseña reseteada correctamente' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al resetear la contraseña' });
  }
};

// DELETE /api/auth/companeros/:id -> el Responsable da de baja a un auxiliar
// (baja lógica: no se borra la fila, solo se inactiva)
export const bajaAuxiliar = async (req: Request, res: Response): Promise<void> => {
  try {
    const idObjetivo = parseInt(req.params.id as string, 10);
    if (isNaN(idObjetivo)) {
      res.status(400).json({ error: 'El ID proporcionado no es válido' });
      return;
    }

    await authService.bajaAuxiliar(idObjetivo, req.usuario!.id_usuario, req.usuario!.id_cargo);
    res.status(200).json({ mensaje: 'Auxiliar dado de baja correctamente' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al dar de baja al auxiliar' });
  }
};