import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1. Crear el Cargo y su Administrador al mismo tiempo
export const crearCargoYAdmin = async (
  nombre_cargo: string, 
  jerarquia: string, 
  nombre_apellido: string, 
  mr: string,
  password_plana: string
) => {
  
  // Verificamos que la matrícula no exista ya
  const existe = await prisma.usuario.findUnique({ where: { mr } });
  if (existe) throw new Error('La M.R ya está registrada en el sistema');

  // Encriptamos la contraseña
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password_plana, salt);

  // Ejecutamos la creación en bloque (Transacción)
  const resultado = await prisma.$transaction(async (tx) => {
    // A. Creamos la "burbuja" (El Cargo)
    const nuevoCargo = await tx.cargo.create({ 
      data: { nombre_cargo } 
    });
    
    // B. Creamos al jefe/responsable y lo metemos en ese cargo
    const nuevoAdmin = await tx.usuario.create({
      data: {
        jerarquia,
        nombre_apellido,
        mr,
        password: password_hash,
        rol: 'RESPONSABLE', 
        id_cargo: nuevoCargo.id_cargo
      }
    });

    return { cargo: nuevoCargo, admin: nuevoAdmin };
  });

  return resultado;
};

// 2. El Login
export const iniciarSesion = async (mr: string, password_plana: string) => {
  // Buscamos al usuario
  const usuario = await prisma.usuario.findUnique({ where: { mr } });
  if (!usuario || !usuario.estado) {
    throw new Error('Usuario no encontrado o dado de baja');
  }

  // Comparamos la contraseña tipeada con la encriptada
  const passwordValida = await bcrypt.compare(password_plana, usuario.password);
  if (!passwordValida) {
    throw new Error('Contraseña incorrecta');
  }

  // Si todo está bien, le armamos su "Credencial Digital" (Token)
  // Acá guardamos su ID, su Rol y su Cargo para saber qué puede ver
  const token = jwt.sign(
    { 
      id_usuario: usuario.id_usuario, 
      rol: usuario.rol, 
      id_cargo: usuario.id_cargo 
    },
    process.env.JWT_SECRET || 'secreto_default',
    { expiresIn: '12h' } // La sesión dura 12 horas
  );

  return { 
    token, 
    usuario: { 
      jerarquia: usuario.jerarquia,
      nombre: usuario.nombre_apellido, 
      rol: usuario.rol, 
      id_cargo: usuario.id_cargo
    } 
  };
};