import express, { Router } from "express";
import { AdminController } from "../controllers/adminController.js";
import { autenticarToken } from "../config/jwtConfig.js";
import validation from "../middlewares/validation.js";
import Admin from "../models/Admin.js";

const router: Router = express.Router();
const adminController = new AdminController(Admin);

// Rotas públicas
router.post("/admin/login", validation.validateLogin, adminController.login.bind(adminController));
router.post("/admin/refresh-token", adminController.refreshToken.bind(adminController));
router.post("/admin/logout", adminController.logout.bind(adminController));

// Rotas protegidas
router.get(
  "/admin/verificar",
  autenticarToken,
  adminController.verificarAutenticacao.bind(adminController),
);
router.post(
  "/admin/cadastrar",
  validation.validateCadastroAdmin,
  autenticarToken,
  adminController.cadastrarAdmin.bind(adminController),
);
router.post(
  "/admin/cadastrar/super-admin",
  validation.validateCadastroAdmin,
  autenticarToken,
  adminController.cadastrarSuperAdmin.bind(adminController),
);
router.get("/admin/listar", autenticarToken, adminController.listarAdmins.bind(adminController));
router.delete(
  "/admin/remover/:id",
  validation.validateIdParam,
  autenticarToken,
  adminController.removerAdmins.bind(adminController),
);
router.put(
  "/admin/atualizar-senha",
  validation.validateMudancaDeSenha,
  autenticarToken,
  adminController.atualizarSenha.bind(adminController),
);

export default router;
