import { Router } from 'express';
import { getDivisiones, createDivision, updateDivision, softDeleteDivision } from '../controllers/division.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', verificarToken, getDivisiones);
router.post('/', verificarToken, createDivision);
router.put('/:id', verificarToken, updateDivision);
router.delete('/:id', verificarToken, soloResponsable, softDeleteDivision);
export default router;