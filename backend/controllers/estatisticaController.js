import Estatistica from '../models/Estatistica.js';
import Usuario from '../models/Usuario.js';


class EstatisticaController {

    // Nétodo para obter estatísticas simples
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

    // Método para reiniciar estatísticas
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

    // Método para obter estatísticas detalhadas
    async obterEstatisticasDetalhadas(req, res) {
        try {
            const estatistica = await Estatistica.getInstance();
            
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

    async decrementarCadastros(req, res) {
        try {
            const estatistica = await Estatistica.decrementarCadastros();
            
            if (estatistica.totalCadastros === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Não é possível decrementar: total de cadastros já está em zero"
                });
            }

            res.json({
                success: true,
                dados: {
                    totalCadastros: estatistica.totalCadastros,
                    totalVerificacoes: estatistica.totalVerificacoes,
                    ultimaAtualizacao: estatistica.ultimaAtualizacao
                }
            });

        } catch (error) {
            console.error("Erro ao decrementar cadastros:", error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
}

export default new EstatisticaController();