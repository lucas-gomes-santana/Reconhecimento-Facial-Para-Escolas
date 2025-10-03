import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import validation from "../middlewares/validation.js";
import { autenticarToken } from "../config/jwtConfig.js";

const router = express.Router();

router.post('/usuarios/cadastrar', autenticarToken, validation.validateCadastroUsuario, usuarioController.cadastrarUsuario);
router.post('/verificar-rosto', autenticarToken, validation.validateVerificacaoRosto, usuarioController.verificarRosto);
router.get('/usuarios/listar', autenticarToken, usuarioController.listarUsuarios);
router.delete('/usuarios/remover/:id', autenticarToken, usuarioController.removerUsuario);
router.patch('/usuarios/bloquear/:id', autenticarToken, usuarioController.bloquearUsuario);

export default router;