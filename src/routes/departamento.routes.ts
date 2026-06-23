import { Router } from 'express';
import { getDepartamentos, createDepartamento, updateDepartamento, softDeleteDepartamento } from '../controllers/departamento.controller';

const router = Router();
router.get('/', getDepartamentos);
router.post('/', createDepartamento);
router.put('/:id', updateDepartamento);
router.delete('/:id', softDeleteDepartamento);
export default router;