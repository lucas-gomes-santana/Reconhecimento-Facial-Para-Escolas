import express from 'express';
import estatisticaController from "../controllers/estatisticaController.js";


const router = express.Router();

router.get('/estatisticas', estatisticaController.obterEstatisticas);

router.get('/estatisticas/detalhadas', estatisticaController.obterEstatisticasDetalhadas);

router.post('/estatisticas/reset', estatisticaController.resetarEstatisticas);

export default router;