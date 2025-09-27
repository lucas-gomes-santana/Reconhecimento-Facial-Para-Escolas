import express from 'express';
import adminController from '../controllers/adminController.js';
import { autenticarToken} from '../config/jwtConfig.js';

const router = express.Router();

// Rotas públicas
router.post('/admin/login', adminController.login);
router.post('/admin/refresh-token', adminController.refreshToken);
router.post('/admin/logout', adminController.logout);

// Rotas protegidas
router.get('/admin/verificar', autenticarToken, adminController.verificarAutenticacao);
router.post('/admin/cadastrar', autenticarToken, adminController.cadastrarAdmin);
router.get('/admin/listar', autenticarToken, adminController.listarAdmins);
router.delete('/admin/remover/:nome', autenticarToken, adminController.removerAdmins);

export default router;