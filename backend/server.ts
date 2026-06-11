import express from "express";
import type { Application } from "express";
import cookieParser from "cookie-parser";
import databaseConfig from "./config/database.ts";
import usuarioRoutes from "./routes/usuarioRoutes.ts";
import estatisticaRoutes from "./routes/estatisticaRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import logEntradaRoutes from "./routes/logEntradaRoutes.js";
import responsavelRoutes from "./routes/responsavelRoutes.js";
import corsConfig from "./config/corsConfig.ts";
import { cadastrarDesenvolvedor } from "./controllers/adminController.ts";
import { seedAlunosMockados } from "./config/seedAlunos.ts";
import Admin from "./models/Admin.ts";

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(corsConfig);
app.use(cookieParser());

app.use("/api", usuarioRoutes);
app.use("/api", estatisticaRoutes);
app.use("/api", adminRoutes);
app.use("/api", logEntradaRoutes);
app.use("/api", responsavelRoutes);

async function startServer() {
  try {
    await databaseConfig.connect();
    await cadastrarDesenvolvedor(Admin);
    await seedAlunosMockados();

    app.listen(3000, () => {
      console.log("Servidor rodando na porta 3000");
      console.log("Sistema de reconhecimento facial inicializado");
    });
  } catch (error) {
    console.error("Erro ao inicializar servidor:", error);
    process.exit(1);
  }
}

startServer();
