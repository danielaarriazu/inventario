import { Router } from 'express';
import { getOficinas, createOficina, updateOficina, softDeleteOficina } from '../controllers/oficina.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', verificarToken, getOficinas);
router.post('/', verificarToken, soloResponsable, createOficina);
router.put('/:id', verificarToken, soloResponsable, updateOficina);
router.delete('/:id', verificarToken, soloResponsable, softDeleteOficina);
export default router;