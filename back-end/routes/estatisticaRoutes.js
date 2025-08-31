import express from 'express';
import estatisticaController from "../controllers/estatisticaController.js";


const router = express.Router();

// Rota para obter estatísticas simples
router.get('/estatisticas', estatisticaController.obterEstatisticas);

// Rota para obter estatísticas detalhadas
router.get('/estatisticas/detalhadas', estatisticaController.obterEstatisticasDetalhadas);

// Rota para resetar estatísticas
router.post('/estatisticas/reset', estatisticaController.resetarEstatisticas);

export default router;