import { Router } from 'express';
import { 
  getEquipos, 
  createEquipo, 
  updateEquipo, 
  softDeleteEquipo 
} from '../controllers/equipo.controller';

const router = Router();

router.get('/', getEquipos);
router.post('/', createEquipo);
router.put('/:id', updateEquipo);
router.delete('/:id', softDeleteEquipo);

export default router;