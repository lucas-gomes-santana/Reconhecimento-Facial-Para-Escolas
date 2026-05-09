import express from "express";
import { ResponsavelController } from "../controllers/responsavelController.js";
import { autenticarResponsavel } from "../middlewares/authResponsavel.js";

const router = express.Router();

const responsavelController = new ResponsavelController();

router.post("/responsaveis/cadastrar", responsavelController.cadastrar.bind(responsavelController));

router.post("/responsaveis/login", responsavelController.login.bind(responsavelController));

router.post(
  "/responsaveis/logout",
  autenticarResponsavel,
  responsavelController.logout.bind(responsavelController),
);

router.get(
  "/responsaveis/perfil",
  autenticarResponsavel,
  responsavelController.perfil.bind(responsavelController),
);

router.get(
  "/responsaveis/meus-alunos",
  autenticarResponsavel,
  responsavelController.meusAlunos.bind(responsavelController),
);

router.get(
  "/responsaveis/entradas/:id",
  autenticarResponsavel,
  responsavelController.entradas.bind(responsavelController),
);

router.get(
  "/responsaveis/merenda/:id",
  autenticarResponsavel,
  responsavelController.merenda.bind(responsavelController),
);

router.post(
  "/responsaveis/vincular",
  autenticarResponsavel,
  responsavelController.vincular.bind(responsavelController),
);

export default router;

