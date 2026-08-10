import { Router } from 'express';
import { getDestinos, createDestino, updateDestino, softDeleteDestino } from '../controllers/destino.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verificarToken, getDestinos);
router.post('/', verificarToken, createDestino);
router.put('/:id', verificarToken, updateDestino);
router.delete('/:id', verificarToken, softDeleteDestino);

export default router;