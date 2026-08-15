import { Router } from 'express';
import { getFichaPublica, getQrPublico } from '../controllers/publico.controller';

// Rutas SIN verificarToken a propósito — son de acceso público,
// pensadas para cuando alguien escanea el QR pegado en un equipo
const router = Router();

router.get('/equipos/:id', getFichaPublica);
router.get('/equipos/:id/qr', getQrPublico);

export default router;