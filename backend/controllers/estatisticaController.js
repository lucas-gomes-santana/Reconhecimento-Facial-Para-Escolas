export class EstatisticaController {

    constructor (estatisticaModel, usuarioModel) {
        this.Estatistica = estatisticaModel;
        this.Usuario = usuarioModel;
    }

    async obterEstatisticas(req, res) {
        try {
            const estatistica = await this.Estatistica.getInstance();
            const totalCadastros = await this.Usuario.countDocuments();
            
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
            res.status(500).json({ message: err.message });
        }
    }

    async reiniciarVerificacoes(req, res) {
        try {
            const estatistica = await this.Estatistica.getInstance();
            estatistica.totalVerificacoes = 0;
            estatistica.ultimaAtualizacao = new Date();
            await estatistica.save();
            
            res.json({
                success: true,
                message: 'Quantidade de verificações reiniciadas com sucesso'
            });
            
        } catch (err) {
            console.error('Erro ao reiniciar verificações:', err);
            res.status(500).json({ message: err.message });
        }
    }

    async obterEstatisticasDetalhadas(req, res) {
        try {
            const estatistica = await this.Estatistica.getInstance();
            const totalCadastros = await this.Usuario.countDocuments();
            
            const usuariosPorTipo = await this.Usuario.aggregate([
                {
                    $group: {
                        _id: '$tipoUsuario',
                        quantidade: { $sum: 1 }
                    }
                }
            ]);

            const primeiroUsuario = await this.Usuario.findOne().sort({ dataCadastro: 1 });
            
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
            res.status(500).json({ message: err.message });
        }
    }

    async gerarRelatorio(req, res) {
        try {
            const estatistica = await this.Estatistica.getInstance();
            const totalCadastros = await this.Usuario.countDocuments();

            const usuariosPorTipo = await this.Usuario.aggregate([
                {
                    $group: {
                        _id: '$tipoUsuario',
                        quantidade: { $sum: 1 }
                    }
                }
            ]);  
            
            const ultimoCadastro = await this.Usuario.findOne().sort({ dataCadastro: -1 });
            const primeiroCadastro = await this.Usuario.findOne().sort({ dataCadastro: 1 });

            // Buscar usuários com nome, tipo E data de cadastro
            const todosUsuarios = await this.Usuario.find({}, 'nome tipoUsuario dataCadastro')
                .sort({ nome: 1 })
                .lean(); // Retorna objetos Javascript puros ao invés do documento MongoDB inteiro, ideal para métodos de leitura

            const ordemTipos = ['Aluno', 'Professor', 'Funcionario', 'Outro'];

            const usuariosOrganizados = ordemTipos.map(tipo => {
                const usuarios = todosUsuarios
                    .filter(u => u.tipoUsuario === tipo)
                    .map(u => ({
                        nome: u.nome,
                        dataCadastro: u.dataCadastro
                    }));

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
            res.status(500).json({ message: error.message });
        }   
    }
    
}