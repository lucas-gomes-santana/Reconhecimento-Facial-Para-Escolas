import express from 'express';
import adminController from '../controllers/adminController.js';
import { autenticarToken } from '../config/jwtConfig.js';

const router = express.Router();

// Rota para login de administradores (PÚBLICA)
router.post('/admin/login', adminController.login);

// Rota para verificar se o token é válido (PROTEGIDA)
router.get('/admin/verificar', autenticarToken, adminController.verificarAutenticacao);

// Rota para cadastrar admins (PROTEGIDA)
router.post('/admin/cadastrar', autenticarToken, adminController.cadastrarAdmin);

// Rota para listar os admins cadastrados
router.get('/admin/listar', autenticarToken, adminController.listarAdmins);

// Rota para remover admin por nome (PROTEGIDA)
router.delete('/admin/remover/:nome', autenticarToken, adminController.removerAdmins);


export default router;