import { Router } from 'express';
import { 
  getEquipos, 
  getEquipoById,
  createEquipo, 
  updateEquipo, 
  softDeleteEquipo,
  getEquipoQR
} from '../controllers/equipo.controller';

const router = Router();

router.get('/', getEquipos);
router.get('/:id', getEquipoById);
router.get('/:id/qr', getEquipoQR);
router.post('/', createEquipo);
router.put('/:id', updateEquipo);
router.delete('/:id', softDeleteEquipo);

export default router;