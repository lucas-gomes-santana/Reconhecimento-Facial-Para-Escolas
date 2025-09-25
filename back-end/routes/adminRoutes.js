import express from 'express';
import adminController from '../controllers/adminController.js';
import { autenticarToken } from '../config/jwtConfig.js';

const router = express.Router();

// Rotas que possuem 'autenticarToken' são protegidas com a autenticação JWT

router.post('/admin/login', adminController.login); // Precisa ser pública para o Adm receber o token

router.get('/admin/verificar', autenticarToken, adminController.verificarAutenticacao);

router.post('/admin/cadastrar', autenticarToken, adminController.cadastrarAdmin);

router.get('/admin/listar', autenticarToken, adminController.listarAdmins);

router.delete('/admin/remover/:nome', autenticarToken, adminController.removerAdmins);


export default router;