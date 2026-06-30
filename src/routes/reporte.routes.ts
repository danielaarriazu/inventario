import { Router } from 'express';
import { exportarExcel } from '../controllers/reporte.controller';
import { verificarToken} from '../middlewares/auth.middleware';

const router = Router();

router.get('/excel', verificarToken, exportarExcel);

export default router;