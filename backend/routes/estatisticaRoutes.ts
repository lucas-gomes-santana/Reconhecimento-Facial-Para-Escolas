import express, { Router } from "express";
import { autenticarToken } from "../config/jwtConfig.ts";
import { EstatisticaController } from "../controllers/estatisticaController.ts";
import Estatistica from "../models/Estatistica.ts";
import Usuario from "../models/Usuario.ts";

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
