import { Router } from 'express';
import { 
  getHistorial, 
  getHistorialByEquipo, 
  createRegistroAuditoria 
} from '../controllers/auditoria.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();

// Ver todos los movimientos (auditoría general) — solo el Responsable
router.get('/', verificarToken, soloResponsable, getHistorial);

// Ver movimientos de un equipo específico (ej: GET /api/auditoria/equipo/5) — cualquiera
router.get('/equipo/:id', verificarToken, getHistorialByEquipo);

// Registrar un movimiento
router.post('/', verificarToken, createRegistroAuditoria);

export default router;