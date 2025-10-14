import Estatistica from '../models/Estatistica.js';
import Usuario from '../models/Usuario.js';

class EstatisticaController {

    async obterEstatisticas(req, res) {
        try {
            const estatistica = await Estatistica.getInstance();
            const totalCadastros = await Usuario.countDocuments();
            
            res.json({
                success: true,
                dados: {
                    totalCadastros: totalCadastros,
                    totalVerificacoes: estatistica.totalVerificacoes,
                    ultimaAtualizacao: estatistica.ultimaAtualizacao
                }
            });
        } catch (err) {
            console.error('Erro ao obter estatísticas:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async resetarEstatisticas(req, res) {
        try {
            const estatistica = await Estatistica.getInstance();
            estatistica.totalCadastros = 0;
            estatistica.totalVerificacoes = 0;
            estatistica.ultimaAtualizacao = new Date();
            await estatistica.save();
            
            res.json({
                success: true,
                message: 'Estatísticas resetadas com sucesso'
            });
        } catch (err) {
            console.error('Erro ao resetar estatísticas:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async obterEstatisticasDetalhadas(req, res) {
        try {
            const estatistica = await Estatistica.getInstance();
            const totalCadastros = await Usuario.countDocuments();
            
            const usuariosPorTipo = await Usuario.aggregate([
                {
                    $group: {
                        _id: '$tipoUsuario',
                        quantidade: { $sum: 1 }
                    }
                }
            ]);

            const primeiroUsuario = await Usuario.findOne().sort({ dataCadastro: 1 });
            
            res.json({
                success: true,
                dados: {
                    totalCadastros: totalCadastros,
                    totalVerificacoes: estatistica.totalVerificacoes,
                    usuariosPorTipo,
                    primeiroCadastro: primeiroUsuario?.dataCadastro,
                    ultimaAtualizacao: estatistica.ultimaAtualizacao
                }
            });
        } catch (err) {
            console.error('Erro ao obter estatísticas detalhadas:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async gerarRelatorio(req, res) {
        try {
            const estatistica = await Estatistica.getInstance();
            const totalCadastros = await Usuario.countDocuments();

            const usuariosPorTipo = await Usuario.aggregate([
                {
                    $group: {
                        _id: '$tipoUsuario',
                        quantidade: { $sum: 1 }
                    }
                }
            ]);  
            
            const ultimoCadastro = await Usuario.findOne().sort({ dataCadastro: -1 });
            const primeiroCadastro = await Usuario.findOne().sort({ dataCadastro: 1 });

            const todosUsuarios = await Usuario.find({}, 'nome tipoUsuario')
                .sort({ nome: 1 })
                .lean(); // Retorna objetos Javscript puros ao invés do documento MongoDB inteiro, ideal para métodos de leitura

            const ordemTipos = ['Aluno', 'Professor', 'Funcionario', 'Outro'];

            const usuariosOrganizados = ordemTipos.map(tipo => {
                const usuarios = todosUsuarios
                    .filter(u => u.tipoUsuario === tipo)
                    .map(u => u.nome);

                return {
                    tipo,
                    usuarios,
                    quantidade: usuarios.length
                }
            }).filter(grupo => grupo.quantidade > 0); // Remove tipos de usuários do relatório caso não haja nenhum cadastrado

            res.json({
                success: true,
                dados: {
                    dataRelatorio: new Date(),
                    totalCadastros,
                    totalVerificacoes: estatistica.totalVerificacoes,
                    usuariosPorTipo,
                    usuariosOrganizados,
                    primeiroCadastro: primeiroCadastro?.dataCadastro,
                    ultimoCadastro: ultimoCadastro?.dataCadastro,
                    ultimaAtualizacao: estatistica.ultimaAtualizacao
                }
            });

        } catch (error) {
            console.error('Erro ao gerar o relatório: ', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }

        
    }
    
}

export default new EstatisticaController();