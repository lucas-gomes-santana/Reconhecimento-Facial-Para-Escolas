const Usuario = require('../models/Usuario');
const Estatistica = require('../models/Estatistica');
const faceRecognitionService = require('../services/faceRecognitionService');

class UsuarioController {

    async cadastrarUsuario(req, res) {
        try {
            const { nome, tipoUsuario, descriptor } = req.body;
            
            const rostoExistente = await faceRecognitionService.verificarRostoExistente(descriptor, 0.4);
            if (rostoExistente) {
                return res.status(409).json({ 
                    error: 'Rosto já cadastrado',
                    usuarioExistente: rostoExistente.nome
                });
            }

            const novoUsuario = new Usuario({ nome, tipoUsuario, descriptor });
            await novoUsuario.save();
            
            // Incrementar contador de cadastros nas estatísticas
            await Estatistica.incrementarCadastros();
            
            console.log(`Usuário ${nome} cadastrado com sucesso`);
            
            res.status(201).json({ 
                success: true,
                usuario: {
                    id: novoUsuario._id,
                    nome: novoUsuario.nome,
                    tipo: novoUsuario.tipoUsuario,
                    data: novoUsuario.dataCadastro
                }
            });
        } catch (err) {
            console.error('Erro no cadastro:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async verificarRosto(req, res) {
        try {
            const { descriptor } = req.body;

            console.log('Iniciando verificação facial...');
            
            const match = await faceRecognitionService.encontrarUsuarioPorSimilaridade(descriptor, 0.6);
            
            // Incrementar contador de verificações nas estatísticas (independente se encontrou ou não)
            await Estatistica.incrementarVerificacoes();
            
            if (match) {
                console.log(`Usuário encontrado: ${match.usuario.nome} (distância: ${match.distancia.toFixed(4)}, similaridade: ${(match.similaridade * 100).toFixed(1)}%)`);
                
                return res.json({ 
                    encontrado: true,
                    usuario: {
                        nome: match.usuario.nome,
                        tipoUsuario: match.usuario.tipoUsuario,
                        dataCadastro: match.usuario.dataCadastro
                    },
                    similaridade: match.similaridade,
                    distancia: match.distancia
                });
            } else {
                console.log('Nenhum usuário similar encontrado');
                return res.json({ encontrado: false });
            }
            
        } catch (err) {
            console.error('Erro na verificação:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async listarUsuarios(req, res) {
        try {
            const usuarios = await Usuario.find({}, { descriptor: 0 });
            res.json(usuarios);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async deletarUsuario(req, res) {
        try {
            const usuario = await Usuario.findByIdAndDelete(req.params.id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            
            // Opcional: decrementar contador de cadastros ao deletar
            // await Estatistica.decrementarCadastros(); // Você pode implementar este método se quiser
            
            res.json({ message: 'Usuário deletado com sucesso' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new UsuarioController();