import express from 'express';
import adminController from '../controllers/adminController.js';
import { autenticarToken } from '../config/jwtConfig.js';

const router = express.Router();

// Rota para login de administradores (PÚBLICA)
router.post('/admin/login', adminController.login);

// Rota para verificar se o token é válido (PROTEGIDA)
router.get('/admin/verificar', autenticarToken, adminController.verificarAutenticacao);

// Rota para cadastrar admins (PROTEGIDA - só admin)
router.post('/admin/cadastrar', autenticarToken, adminController.cadastrarAdmin);


export default router;