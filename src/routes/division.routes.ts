import { Router } from 'express';
import { getDivisiones, createDivision, updateDivision, softDeleteDivision } from '../controllers/division.controller';

const router = Router();
router.get('/', getDivisiones);
router.post('/', createDivision);
router.put('/:id', updateDivision);
router.delete('/:id', softDeleteDivision);
export default router;