import { Router } from 'express';
import { registrarCargo, login, obtenerAuxiliares, registrarAuxiliar, obtenerPerfil  } from '../controllers/auth.controller';
import { authMiddleware, soloResponsable  } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint para crear el primer cargo (Ej: POST /api/auth/registrar-cargo)
router.post('/registrar-cargo', registrarCargo);

// Endpoint para entrar al sistema (Ej: POST /api/auth/login)
router.post('/login', login);

// GET /api/auth/me -> Datos del usuario logueado (matrícula, nombre, rol)
router.get('/me', authMiddleware, obtenerPerfil);

// POST /api/auth/companeros -> Registra un nuevo auxiliar en tu misma burbuja
router.post('/companeros', authMiddleware, soloResponsable, registrarAuxiliar);

// GET /api/auth/companeros -> Trae solo los auxiliares de tu cargo
router.get('/companeros', authMiddleware, obtenerAuxiliares);

export default router;