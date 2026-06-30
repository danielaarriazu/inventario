import { Router } from 'express';
import { registrarCargo, login } from '../controllers/auth.controller';

const router = Router();

// Endpoint para crear el primer cargo (Ej: POST /api/auth/registrar-cargo)
router.post('/registrar-cargo', registrarCargo);

// Endpoint para entrar al sistema (Ej: POST /api/auth/login)
router.post('/login', login);

export default router;