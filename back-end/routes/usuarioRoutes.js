import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import validation from "../middlewares/validation.js";
import { autenticarToken } from "../config/jwtConfig.js";

const router = express.Router();

// Rotas que possuem 'autenticarToken' são protegidas com a autenticação JWT

router.post('/usuarios/cadastrar', autenticarToken, validation.validateCadastroUsuario, usuarioController.cadastrarUsuario);

router.post('/verificar-rosto', validation.validateVerificacaoRosto, usuarioController.verificarRosto);

router.get('/usuarios/listar', usuarioController.listarUsuarios);

router.delete('/usuarios/remover/:nome', autenticarToken, usuarioController.deletarUsuario);

export default router;