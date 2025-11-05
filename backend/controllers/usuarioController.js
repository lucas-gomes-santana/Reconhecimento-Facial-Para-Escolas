import Usuario from '../models/Usuario.js';

let threshold = 0.96; // Percentual mínimo de 96% de similaridade para sucesso na autenticação facial

export class UsuarioController {

    constructor (faceRecognitionService, estatisticaModel) {
        this.faceRecognitionService = faceRecognitionService;
        this.Estatistica = estatisticaModel;
        this.Usuario = Usuario;
        this.threshold = threshold;
    }


    async cadastrarUsuario(req, res) {
        try {
            const { nome, tipoUsuario, descriptor } = req.body;

            const rostoExistente = await this.faceRecognitionService.verificarRostoExistente(descriptor, threshold);
            
            if (rostoExistente) {
                return res.status(409).json({ 
                    error: 'Rosto já cadastrado',
                    usuarioExistente: rostoExistente.nome
                });
            }

            const novoUsuario = new Usuario({ nome, tipoUsuario, descriptor });
            await novoUsuario.save();
            
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
            const { descriptor, contexto } = req.body;

            console.log('Iniciando verificação facial...');
            
            const match = await this.faceRecognitionService.encontrarUsuarioPorSimilaridade(descriptor, threshold);
            
            // Incrementando o contador de verificações apenas se o contexto não for 'cadastro'
            if (contexto !== 'cadastro') {
                await this.Estatistica.incrementarVerificacoes();
            }
            
            if (match) {
                console.log(`Usuário encontrado: ${match.usuario.nome} (similaridade: ${(match.similaridade * 100).toFixed(1)}%)`);
                
                // Verificar se o usuário pode pegar merenda ou não
                const estaBloqueado = match.usuario.status === 'bloqueado';
                const aindaBloqueado = estaBloqueado && match.usuario.bloqueadoAte && new Date(match.usuario.bloqueadoAte) > new Date();
                
                return res.json({ 
                    encontrado: true,
                    usuario: {
                        id: match.usuario._id,
                        nome: match.usuario.nome,
                        tipoUsuario: match.usuario.tipoUsuario,
                        dataCadastro: match.usuario.dataCadastro,
                        status: match.usuario.status,
                        bloqueadoAte: match.usuario.bloqueadoAte,
                    },
                    bloqueado: aindaBloqueado,
                    similaridade: match.similaridade,
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

    async removerUsuario (req, res) {
        const { id } = req.params;

        const usuario = await Usuario.findByIdAndDelete(id);
        
        if (!usuario) {
            return res.status(404).json({ message: `Usuário ${usuario.nome} não encontrado` });
        }

        console.log(`Usuário ${usuario.nome} removido do C.E.R.F com sucesso`);
        
        res.json({ message: `Usuário ${usuario.nome} removido com sucesso` });
    }

    async removerTodosOsUsuarios (req, res) {
        const usuario = await this.Usuario.deleteMany({});

        const mensagem = usuario.deletedCount === 0
            ? "Não há usuários cadastrados no sistema para remover."
            : "Todos os usuários foram removidos com sucesso!";

        res.status(200).json({
            success: true,
            message: mensagem
        });
    }

    bloquearUsuario = async (req, res) => {
        const { id } = req.params;

        const tempoBloqueio = 60 * 1000; // 1 minuto em milissegundos (ajustar para um tempo maior em produção)
        const bloqueadoAte = new Date(Date.now() + tempoBloqueio);

        const usuario = await Usuario.findByIdAndUpdate(id, {
            status: 'bloqueado',
            bloqueadoAte: bloqueadoAte,
        }, { new: true }); // Retorna o documento atualizado

        if (!usuario) {
            return res.status(409).json({ message: `Usuário ${usuario.nome} não encontrado!` });
        }

        this.agendarDesbloqueio(id, tempoBloqueio);

        console.log(`Usuário ${usuario.nome} proibido de pegar merenda por 1 minuto`)

        return res.json({
            success: true,
            message: `Usuário ${usuario.nome} proibido de pegar merenda por 1 minuto`,
        });
    }

    agendarDesbloqueio = async (usuarioId, tempo) => {
        setTimeout(async () => {
            try {
                const usuario = await Usuario.findByIdAndUpdate(usuarioId, {
                    status: 'liberado',
                    bloqueadoAte: null,
                });
                console.log(`Usuário ${usuario.nome} liberdo para pegar merenda`);

            } catch (error) {
                console.error("Erro ao desbloquear usuário: ", error);
            }
        }, tempo);
    }
}

