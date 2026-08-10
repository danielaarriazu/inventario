import { Router } from 'express';
import { getOficinas, createOficina, updateOficina, softDeleteOficina } from '../controllers/oficina.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', verificarToken, getOficinas);
router.post('/', verificarToken, createOficina);
router.put('/:id', verificarToken, updateOficina);
router.delete('/:id', verificarToken, soloResponsable, softDeleteOficina);
export default router;