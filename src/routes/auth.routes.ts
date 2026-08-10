import { Router } from 'express';
import { registrarCargo, login, obtenerAuxiliares, registrarAuxiliar, obtenerPerfil  } from '../controllers/auth.controller';
import { verificarToken, soloResponsable  } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint para crear el primer cargo (Ej: POST /api/auth/registrar-cargo)
router.post('/registrar-cargo', registrarCargo);

// Endpoint para entrar al sistema (Ej: POST /api/auth/login)
router.post('/login', login);

// GET /api/auth/me -> Datos del usuario logueado (matrícula, nombre, rol)
router.get('/me', verificarToken, obtenerPerfil);

// POST /api/auth/companeros -> Registra un nuevo auxiliar en tu misma burbuja
router.post('/companeros', verificarToken, soloResponsable, registrarAuxiliar);

// GET /api/auth/companeros -> Trae solo los auxiliares de tu cargo
router.get('/companeros', verificarToken, obtenerAuxiliares);

export default router;