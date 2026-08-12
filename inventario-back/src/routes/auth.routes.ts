import { Router } from 'express';
import { registrarCargo, login, obtenerAuxiliares, registrarAuxiliar, obtenerPerfil, cambiarPassword, resetearPasswordAuxiliar, bajaAuxiliar } from '../controllers/auth.controller';
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

// GET /api/auth/companeros -> Trae los auxiliares activos de tu cargo (solo el Responsable)
router.get('/companeros', verificarToken, soloResponsable, obtenerAuxiliares);

// PUT /api/auth/companeros/:id/password -> el Responsable resetea la contraseña de un auxiliar
router.put('/companeros/:id/password', verificarToken, soloResponsable, resetearPasswordAuxiliar);

// DELETE /api/auth/companeros/:id -> el Responsable da de baja (lógica) a un auxiliar
router.delete('/companeros/:id', verificarToken, soloResponsable, bajaAuxiliar);

export default router;