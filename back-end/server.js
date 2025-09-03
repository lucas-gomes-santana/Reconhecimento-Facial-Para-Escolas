import express from "express";
import cors from "cors";
import databaseConfig from "./config/database.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import estatisticaRoutes from "./routes/estatisticaRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api", usuarioRoutes);
app.use("/api", estatisticaRoutes);
app.use("/api", adminRoutes);

// Inicialização do servidor
async function startServer() {
  try {
    await databaseConfig.connect();

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
