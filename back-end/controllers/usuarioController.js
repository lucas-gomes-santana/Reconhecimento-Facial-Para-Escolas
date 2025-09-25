import Usuario from '../models/Usuario.js';
import Estatistica from '../models/Estatistica.js';
import faceRecognitionService from '../services/faceRecognitionService.js';

class UsuarioController {

    // Método de cadastro com reconhecimento facial
    async cadastrarUsuario(req, res) {
        try {
            const { nome, tipoUsuario, descriptor } = req.body;
            
            const rostoExistente = await faceRecognitionService.verificarRostoExistente(descriptor, 0.6);
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

    // Método de verificação facial
    async verificarRosto(req, res) {
        try {
            // Obtendo o 'contexto' do corpo da requisição
            const { descriptor, contexto } = req.body;

            console.log('Iniciando verificação facial...');
            
            const match = await faceRecognitionService.encontrarUsuarioPorSimilaridade(descriptor, 0.6);
            
            // Incrementando o contador apenas se o contexto não for 'cadastro'
            if (contexto !== 'cadastro') {
                await Estatistica.incrementarVerificacoes();
            }
            
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
            const usuarios = await Usuario.find({}, { descriptor: 0 }).sort({ dataCadastro: -1 }); // Listando os usuários cadastrados mais recentemente primeiro
            res.json(usuarios);
        } catch (err) {
            console.error('Erro ao listar usuários:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async deletarUsuario(req, res) {
        try {
            const { nome } = req.params;
            
            if (!nome) {
                return res.status(400).json({ error: 'Nome do usuário é obrigatório' });
            }

            const usuario = await Usuario.findOneAndDelete({ nome });
            
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            await Estatistica.decrementarCadastros();
            
            console.log(`Usuário ${nome} removido com sucesso`);
            
            res.json({ 
                success: true, 
                message: `Usuário ${nome} removido com sucesso`,
                usuarioRemovido: {
                    nome: usuario.nome,
                    tipoUsuario: usuario.tipoUsuario,
                    dataCadastro: usuario.dataCadastro
                }
            });
            
        } catch (err) {
            console.error('Erro ao remover usuário:', err);
            res.status(500).json({ error: err.message });
        }
    }
}

export default new UsuarioController();