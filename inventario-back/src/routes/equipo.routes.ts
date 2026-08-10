import { Router } from 'express';
import { 
  getEquipos, 
  getEquipoById,
  createEquipo, 
  updateEquipo, 
  softDeleteEquipo,
  getEquipoQR
} from '../controllers/equipo.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verificarToken, getEquipos);
router.get('/:id', verificarToken, getEquipoById);
router.get('/:id/qr', verificarToken, getEquipoQR);
router.post('/', verificarToken, createEquipo);
router.put('/:id', verificarToken, updateEquipo);
router.delete('/:id', verificarToken, soloResponsable, softDeleteEquipo);

export default router;