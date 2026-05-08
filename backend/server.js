import express from "express";
import cookieParser from "cookie-parser";
import databaseConfig from "./config/database.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import estatisticaRoutes from "./routes/estatisticaRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import logEntradaRoutes from "./routes/logEntradaRoutes.js";
import corsConfig from "./config/corsConfig.js";
import { cadastrarDesenvolvedor }  from "./controllers/adminController.js";
import  Admin  from "./models/Admin.js";


const app = express();

// Middlewares
app.use(express.json());
app.use(corsConfig);
app.use(cookieParser());

app.use("/api", usuarioRoutes);
app.use("/api", estatisticaRoutes);
app.use("/api", adminRoutes);
app.use("/api", logEntradaRoutes);

async function startServer() {
  try {
    await databaseConfig.connect(); 
    await cadastrarDesenvolvedor(Admin);

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
