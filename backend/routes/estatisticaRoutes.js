import express from 'express';
import estatisticaController from "../controllers/estatisticaController.js";
import { autenticarToken } from "../config/jwtConfig.js";


const router = express.Router();

router.get('/estatisticas', estatisticaController.obterEstatisticas);

router.get('/estatisticas/detalhadas', estatisticaController.obterEstatisticasDetalhadas);

router.post('/estatisticas/reset', autenticarToken,estatisticaController.resetarEstatisticas);

router.post('/estatisticas/relatorio', autenticarToken, estatisticaController.gerarRelatorio);

export default router;