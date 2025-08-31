import express from "express";
import usuarioController from "../controllers/usuarioController.js";
import validation from "../middlewares/validation.js";


const router = express.Router();

router.post('/usuarios', validation.validateCadastroUsuario, usuarioController.cadastrarUsuario);
router.post('/verificar-rosto', validation.validateVerificacaoRosto, usuarioController.verificarRosto);
router.get('/usuarios', usuarioController.listarUsuarios);
router.delete('/usuarios/:nome', usuarioController.deletarUsuario);

export default router;