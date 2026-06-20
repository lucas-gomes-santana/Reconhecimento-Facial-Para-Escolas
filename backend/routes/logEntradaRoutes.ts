import express, { Router } from "express";
import { autenticarToken } from "../config/jwtConfig.ts";
import { LogEntradaController } from "../controllers/logEntradaController.ts";
import LogEntrada from "../models/LogEntrada.ts";
import Estatistica from "../models/Estatistica.ts";

const router: Router = express.Router();

const logEntradaController = new LogEntradaController(LogEntrada, Estatistica);

router.get(
  "/logs/entrada/usuario/:usuarioId",
  autenticarToken,
  logEntradaController.buscarLogsPorUsuario.bind(logEntradaController),
);

router.get(
  "/logs/entrada/aluno/:alunoMatriculaId",
  autenticarToken,
  logEntradaController.buscarLogsPorAlunoMatricula.bind(logEntradaController),
);

router.get(
  "/logs/entrada",
  autenticarToken,
  logEntradaController.buscarLogsPorData.bind(logEntradaController),
);

router.post(
  "/logs/entrada",
  autenticarToken,
  logEntradaController.registrarLog.bind(logEntradaController),
);

export default router;
