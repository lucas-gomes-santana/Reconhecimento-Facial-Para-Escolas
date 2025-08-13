const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const validation = require('../middlewares/validation');

const router = express.Router();

router.post('/usuarios', validation.validateCadastroUsuario, usuarioController.cadastrarUsuario);
router.post('/verificar-rosto', validation.validateVerificacaoRosto, usuarioController.verificarRosto);
router.get('/usuarios', usuarioController.listarUsuarios);
router.delete('/usuarios/:id', usuarioController.deletarUsuario);

module.exports = router;