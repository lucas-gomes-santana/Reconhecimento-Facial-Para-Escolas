import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import validation from "../middlewares/validation.js";
import { autenticarToken } from "../config/jwtConfig.js";

const router = express.Router();

router.post('/usuarios/cadastrar', validation.validateCadastroUsuario, autenticarToken, validation.validateCadastroUsuario, usuarioController.cadastrarUsuario);
router.post('/verificar-rosto', validation.validateVerificacaoRosto, autenticarToken, validation.validateVerificacaoRosto, usuarioController.verificarRosto);
router.get('/usuarios/listar', autenticarToken, usuarioController.listarUsuarios);
router.delete('/usuarios/remover/:id', validation.validateIdParam, autenticarToken, usuarioController.removerUsuario);
router.delete('/usuarios/remover-todos', autenticarToken, usuarioController.removerTodosOsUsuarios);
router.patch('/usuarios/bloquear/:id', validation.validateIdParam, autenticarToken, usuarioController.bloquearUsuario);

export default router;