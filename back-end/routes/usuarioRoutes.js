import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import validation from "../middlewares/validation.js";

const router = express.Router();

// Rota de cadastro
router.post('/usuarios', validation.validateCadastroUsuario, usuarioController.cadastrarUsuario);

// Rota de verificação facial
router.post('/verificar-rosto', validation.validateVerificacaoRosto, usuarioController.verificarRosto);

// Rota para listar usuários cadastrados
router.get('/usuarios', usuarioController.listarUsuarios);

// Rota para remover usuários por nome
router.delete('/usuarios/:nome', usuarioController.deletarUsuario);

export default router;