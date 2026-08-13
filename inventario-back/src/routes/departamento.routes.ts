import { Router } from 'express';
import { getDepartamentos, createDepartamento, updateDepartamento, softDeleteDepartamento } from '../controllers/departamento.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', verificarToken, getDepartamentos);
router.post('/', verificarToken, soloResponsable, createDepartamento);
router.put('/:id', verificarToken, soloResponsable, updateDepartamento);
router.delete('/:id', verificarToken, soloResponsable, softDeleteDepartamento);
export default router;