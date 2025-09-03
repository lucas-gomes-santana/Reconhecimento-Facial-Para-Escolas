import express from 'express';
import adminController from '../controllers/adminController.js';


const router = express.Router();

// Rota para login de administradores
router.post('/admin/login', adminController.login);

export default router;