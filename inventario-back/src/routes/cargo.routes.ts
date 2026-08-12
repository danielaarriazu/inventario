import { Router } from 'express';
import { getEncabezado, updateEncabezado } from '../controllers/cargo.controller';
import { verificarToken, soloResponsable } from '../middlewares/auth.middleware';

const router = Router();

router.get('/encabezado', verificarToken, getEncabezado);
router.put('/encabezado', verificarToken, soloResponsable, updateEncabezado);

export default router;