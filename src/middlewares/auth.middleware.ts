import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id_usuario: number;
  rol: 'RESPONSABLE' | 'SUBORDINADO';
  id_cargo: number;
}

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  // Buscamos el token en las cabeceras (Header: Authorization: Bearer <TOKEN>)
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(403).json({ error: 'Acceso denegado. No se proporcionó un token de seguridad.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_default') as TokenPayload;
    
    // Inyectamos los datos decodificados en la petición para que los controladores los usen
    req.usuario = decoded;
    
    next(); // Validado con éxito, lo dejamos pasar a la ruta
  } catch (error) {
    res.status(401).json({ error: 'Sesión inválida o expirada. Por favor, vuelva a iniciar sesión.' });
  }
};

// Middleware opcional por si querés bloquear rutas solo para Jefes (RESPONSABLE)
export const soloResponsable = (req: Request, res: Response, next: NextFunction) => {
  if (req.usuario && req.usuario.rol === 'RESPONSABLE') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso restringido. Esta acción solo puede ser realizada por el Responsable del cargo.' });
  }
};