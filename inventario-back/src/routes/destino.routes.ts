import { Router } from 'express';
import { getDestinos, createDestino, updateDestino, softDeleteDestino } from '../controllers/destino.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verificarToken, getDestinos);
router.post('/', verificarToken, soloResponsable, createDestino);
router.put('/:id', verificarToken, soloResponsable, updateDestino);
router.delete('/:id', verificarToken, soloResponsable, softDeleteDestino);

export default router;