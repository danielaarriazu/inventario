import { Router } from 'express';
import { 
  getEquipos, 
  createEquipo, 
  updateEquipo, 
  softDeleteEquipo 
} from '../controllers/equipo.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verificarToken, getEquipos);
router.post('/', verificarToken, createEquipo);
router.put('/:id', verificarToken, updateEquipo);
router.delete('/:id', verificarToken, soloResponsable, softDeleteEquipo);

export default router;