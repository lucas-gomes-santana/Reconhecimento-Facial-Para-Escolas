import Admin from '../models/Admin.js';

// Função para validar senha do front-end em relação ao banco
function verificarSenha(senhaInformada, senhaArmazenada) {
    return senhaInformada === senhaArmazenada;
}

class AdminController {

    // Método de login
    async login(req, res) {
        try {
            const {nome, senha} = req.body;

            if (!nome || !senha) {
                return res.status(400).json({
                    success: false,
                    message: "Nome e senha de administrador são obrigatórios!"
                });
            }

            const admin = await Admin.findOne({ nome: nome});

            if(!admin) {
                return res.status(404).json({
                    success: false,
                    message: `Admin '${nome}' não encontrado!`
                });
            }

            const senhaCorreta = verificarSenha(senha, admin.senha); // Chama a função verificarSenha

            if(!senhaCorreta) {
                return res.status(401).json({
                    success: false,
                    message: `Senha do admin incorreta!`
                });
            }

            // Retorna resposta 200 se tudo estiver certo
            return res.status(200).json({
                success: true,
                message: 'Admin encontrado e autenticado',
                admin: {
                    id: admin._id,
                    nome: admin.nome,
                    funcao: admin.funcao
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

export default new AdminController();