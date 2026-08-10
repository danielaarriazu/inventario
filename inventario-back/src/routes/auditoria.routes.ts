import { Router } from 'express';
import { 
  getHistorial, 
  getHistorialByEquipo, 
  createRegistroAuditoria 
} from '../controllers/auditoria.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Ver todos los movimientos
router.get('/', verificarToken, getHistorial);

// Ver movimientos de un equipo específico (ej: GET /api/auditoria/equipo/5)
router.get('/equipo/:id', verificarToken, getHistorialByEquipo);

// Registrar un movimiento
router.post('/', verificarToken, createRegistroAuditoria);

export default router;