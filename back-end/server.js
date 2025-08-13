const express = require('express');
const cors = require('cors');
const databaseConfig = require('./config/database');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', usuarioRoutes);

// Inicialização do servidor
async function startServer() {
    try {
        await databaseConfig.connect();
        
        app.listen(3000, () => {
            console.log('Servidor rodando na porta 3000');
            console.log('Sistema de reconhecimento facial inicializado');
        });
    } catch (error) {
        console.error('Erro ao inicializar servidor:', error);
        process.exit(1);
    }
}

startServer();