import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import validation from "../middlewares/validation.js";
import { autenticarToken } from "../config/jwtConfig.js";

const router = express.Router();

// Rota de cadastro
router.post('/usuarios/cadastrar', validation.validateCadastroUsuario, usuarioController.cadastrarUsuario);

// Rota de verificação facial
router.post('/verificar-rosto', validation.validateVerificacaoRosto, usuarioController.verificarRosto);

// Rota para listar usuários cadastrados
router.get('/usuarios/listar', usuarioController.listarUsuarios);

// Rota para remover usuários por nome
router.delete('/usuarios/remover/:nome', autenticarToken, usuarioController.deletarUsuario);

export default router;