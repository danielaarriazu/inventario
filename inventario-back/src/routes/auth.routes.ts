import { Router } from 'express';
import { registrarCargo, login, obtenerAuxiliares, registrarAuxiliar, obtenerPerfil, cambiarPassword, resetearPasswordAuxiliar } from '../controllers/auth.controller';
import { verificarToken, soloResponsable  } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint para crear el primer cargo (Ej: POST /api/auth/registrar-cargo)
router.post('/registrar-cargo', registrarCargo);

// Endpoint para entrar al sistema (Ej: POST /api/auth/login)
router.post('/login', login);

// GET /api/auth/me -> Datos del usuario logueado (matrícula, nombre, rol)
router.get('/me', verificarToken, obtenerPerfil);

// PUT /api/auth/me/password -> cambio mi propia contraseña (sé la actual)
router.put('/me/password', verificarToken, cambiarPassword);

// POST /api/auth/companeros -> Registra un nuevo auxiliar en tu misma burbuja
router.post('/companeros', verificarToken, soloResponsable, registrarAuxiliar);

// GET /api/auth/companeros -> Trae solo los auxiliares de tu cargo
router.get('/companeros', verificarToken, obtenerAuxiliares);

// PUT /api/auth/companeros/:id/password -> el Responsable resetea la contraseña de un auxiliar
router.put('/companeros/:id/password', verificarToken, soloResponsable, resetearPasswordAuxiliar);

export default router;