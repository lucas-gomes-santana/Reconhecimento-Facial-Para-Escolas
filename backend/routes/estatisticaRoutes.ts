import express, { Router } from "express";
import { autenticarToken } from "../config/jwtConfig.js";
import { EstatisticaController } from "../controllers/estatisticaController.js";
import Estatistica from "../models/Estatistica.js";
import Usuario from "../models/Usuario.js";

const router: Router = express.Router();

const estatisticaController = new EstatisticaController(Estatistica, Usuario);

router.get("/estatisticas", estatisticaController.obterEstatisticas.bind(estatisticaController));

router.get(
  "/estatisticas/detalhadas",
  estatisticaController.obterEstatisticasDetalhadas.bind(estatisticaController),
);

router.post(
  "/estatisticas/reset",
  autenticarToken,
  estatisticaController.reiniciarVerificacoes.bind(estatisticaController),
);

router.post(
  "/estatisticas/relatorio",
  autenticarToken,
  estatisticaController.gerarRelatorio.bind(estatisticaController),
);

export default router;
