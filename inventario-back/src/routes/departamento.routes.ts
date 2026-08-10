import { Router } from 'express';
import { getDepartamentos, createDepartamento, updateDepartamento, softDeleteDepartamento } from '../controllers/departamento.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', verificarToken, getDepartamentos);
router.post('/', verificarToken, createDepartamento);
router.put('/:id', verificarToken, updateDepartamento);
router.delete('/:id', verificarToken, soloResponsable, softDeleteDepartamento);
export default router;