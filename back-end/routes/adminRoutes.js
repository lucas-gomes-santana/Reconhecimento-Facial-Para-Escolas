import express from 'express';
import adminController from '../controllers/adminController.js';


const router = express.Router();

// Rota para login de administradores
router.post('/admin/login', adminController.login);

// Rota para cadastrar admins
router.post('/admin/cadastrar', adminController.cadastrarAdmin);

export default router;