import { Router } from 'express';
import { exportarExcel } from '../controllers/reporte.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();

router.get('/excel', verificarToken, soloResponsable, exportarExcel);

export default router;