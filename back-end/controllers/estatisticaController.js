const Estatistica = require('../models/Estatistica');

class EstatisticaController {

    async obterEstatisticas(req, res) {
        try {
            const estatistica = await Estatistica.getInstance();
            
            res.json({
                success: true,
                dados: {
                    totalCadastros: estatistica.totalCadastros,
                    totalVerificacoes: estatistica.totalVerificacoes,
                    ultimaAtualizacao: estatistica.ultimaAtualizacao
                }
            });
        } catch (err) {
            console.error('Erro ao obter estatísticas:', err);
            res.status(500).json({ error: err.message });
        }
    }

    // Método para resetar estatísticas (útil para testes ou início de período)
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

    // Método para obter estatísticas detalhadas (opcional)
    async obterEstatisticasDetalhadas(req, res) {
        try {
            const estatistica = await Estatistica.getInstance();
            const Usuario = require('../models/Usuario');
            
            // Contar usuários por tipo
            const usuariosPorTipo = await Usuario.aggregate([
                {
                    $group: {
                        _id: '$tipoUsuario',
                        quantidade: { $sum: 1 }
                    }
                }
            ]);

            // Obter data do primeiro cadastro
            const primeiroUsuario = await Usuario.findOne().sort({ dataCadastro: 1 });
            
            res.json({
                success: true,
                dados: {
                    totalCadastros: estatistica.totalCadastros,
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
}

module.exports = new EstatisticaController();