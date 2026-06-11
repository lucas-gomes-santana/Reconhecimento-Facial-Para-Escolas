import express, { Router } from "express";
import validation from "../middlewares/validation.js";
import { autenticarToken } from "../config/jwtConfig.js";
import { UsuarioController } from "../controllers/usuarioController.js";
import { FaceRecognitionService } from "../services/faceRecognitionService.js";
import Estatistica from "../models/Estatistica.js";

const router: Router = express.Router();

const faceRecognitionService = new FaceRecognitionService();
const usuarioController = new UsuarioController(faceRecognitionService, Estatistica);

router.post(
  "/usuarios/cadastrar",
  validation.validateCadastroUsuario,
  autenticarToken,
  usuarioController.cadastrarUsuario.bind(usuarioController),
);
router.post(
  "/verificar-rosto",
  validation.validateVerificacaoRosto,
  autenticarToken,
  usuarioController.verificarRosto.bind(usuarioController),
);
router.get(
  "/usuarios/listar",
  autenticarToken,
  usuarioController.listarUsuarios.bind(usuarioController),
);
router.delete(
  "/usuarios/remover/:id",
  validation.validateIdParam,
  autenticarToken,
  usuarioController.removerUsuario.bind(usuarioController),
);
router.delete(
  "/usuarios/remover-todos",
  autenticarToken,
  usuarioController.removerTodosOsUsuarios.bind(usuarioController),
);
router.patch(
  "/usuarios/bloquear/:id",
  validation.validateIdParam,
  autenticarToken,
  usuarioController.bloquearUsuario.bind(usuarioController),
);

export default router;
