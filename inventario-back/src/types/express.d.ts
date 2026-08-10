// src/types/express.d.ts
import { RolUsuario } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id_usuario: number;
        rol: RolUsuario;
        id_cargo: number;
      };
    }
  }
}