import { Router } from 'express';
import { 
  getHistorial, 
  getHistorialByEquipo, 
  createRegistroAuditoria 
} from '../controllers/auditoria.controller';

const router = Router();

// Ver todos los movimientos
router.get('/', getHistorial);

// Ver movimientos de un equipo específico (ej: GET /api/auditoria/equipo/5)
router.get('/equipo/:id', getHistorialByEquipo);

// Registrar un movimiento
router.post('/', createRegistroAuditoria);

export default router;