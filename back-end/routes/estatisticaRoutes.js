const express = require('express');
const estatisticaController = require('../controllers/estatisticaController');

const router = express.Router();

// Rota para obter estatísticas simples
router.get('/estatisticas', estatisticaController.obterEstatisticas);

// Rota para obter estatísticas detalhadas
router.get('/estatisticas/detalhadas', estatisticaController.obterEstatisticasDetalhadas);

// Rota para resetar estatísticas (opcional - útil para testes)
router.post('/estatisticas/reset', estatisticaController.resetarEstatisticas);

module.exports = router;