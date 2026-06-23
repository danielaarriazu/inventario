import { Router } from 'express';
import { getDestinos, createDestino, updateDestino, softDeleteDestino } from '../controllers/destino.controller';

const router = Router();

router.get('/', getDestinos);
router.post('/', createDestino);
router.put('/:id', updateDestino);
router.delete('/:id', softDeleteDestino);

export default router;