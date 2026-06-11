import express from "express";
import { autenticarToken } from "../config/jwtConfig.ts";
import { LogEntradaController } from "../controllers/logEntradaController.js";
import LogEntrada from "../models/LogEntrada.js";
import Estatistica from "../models/Estatistica.ts";

// Solução temporária para arquivos javascript
/** @type {import("express").Router} */
const router = express.Router();

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
