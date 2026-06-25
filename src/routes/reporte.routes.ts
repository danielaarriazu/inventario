import { Router } from 'express';
import { exportarExcel } from '../controllers/reporte.controller';

const router = Router();

router.get('/excel', exportarExcel);

export default router;