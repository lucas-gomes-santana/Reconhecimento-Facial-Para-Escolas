import express from 'express';
import adminController from '../controllers/adminController.js';
import { autenticarToken } from '../config/jwtConfig.js';
import validation from '../middlewares/validation.js';

const router = express.Router();

// Rotas públicas
router.post('/admin/login', validation.validateLogin, adminController.login);
router.post('/admin/refresh-token', adminController.refreshToken);
router.post('/admin/logout', adminController.logout);

// Rotas protegidas
router.get('/admin/verificar', autenticarToken, adminController.verificarAutenticacao);
router.post('/admin/cadastrar', validation.validateCadastroAdmin, autenticarToken, adminController.cadastrarAdmin);
router.post('/admin/cadastrar/super-admin', validation.validateCadastroAdmin, autenticarToken, adminController.cadastrarSuperAdmin);
router.get('/admin/listar', autenticarToken, adminController.listarAdmins);
router.delete('/admin/remover/:id', validation.validateId, autenticarToken, adminController.removerAdmins);
router.put('/admin/atualizar-senha', validation.validateMudancaDeSenha, autenticarToken, adminController.atualizarSenha);

export default router;