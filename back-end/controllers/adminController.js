import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt'; // npm install bcrypt

// Função para validar senha do front-end em relação ao banco
async function verificarSenha(senhaInformada, senhaArmazenada) {
    return await bcrypt.compare(senhaInformada, senhaArmazenada);
}

// Função para criptografar senha
async function criptografarSenha(senha) {
    const saltRounds = 12;
    return await bcrypt.hash(senha, saltRounds);
}

// Função para validar funções dos ADMs
function validarFuncao(funcao) {
    const funcoesValidas = ['admin', 'seguranca'];
    return funcoesValidas.includes(funcao.toLowerCase());
}

class AdminController {

    // Método de login
    async login(req, res) {
        try {
            const { nome, senha } = req.body;

            if (!nome || !senha) {
                return res.status(400).json({
                    success: false,
                    message: "Nome e senha de administrador são obrigatórios!"
                });
            }

            const admin = await Admin.findOne({ nome: nome });

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: `Admin '${nome}' não encontrado!`
                });
            }

            const senhaCorreta = await verificarSenha(senha, admin.senha);

            if (!senhaCorreta) {
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

    // Método de cadastro de admins
    async cadastrarAdmin(req, res) {
        try {
            const { nome, senha, funcao } = req.body;

            // Validações
            if (!nome || !senha || !funcao) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, senha e função são obrigatórios!'
                });
            }

            // Validar função
            if (!validarFuncao(funcao)) {
                return res.status(400).json({
                    success: false,
                    message: 'Função deve ser "admin" ou "seguranca"!'
                });
            }

            // Verificar se nome já existe
            const adminExistente = await Admin.findOne({ nome: nome });
            if (adminExistente) {
                return res.status(409).json({
                    success: false,
                    message: 'Já existe um administrador com este nome!'
                });
            }

            // Validar força da senha
            if (senha.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha deve ter no mínimo 8 caracteres!'
                });
            }

            // Criptografar senha
            const senhaCriptografada = await criptografarSenha(senha);

            const novoAdmin = new Admin({
                nome,
                senha: senhaCriptografada,
                funcao: funcao.toLowerCase()
            });

            await novoAdmin.save();

            console.log(`Admin ${nome} de função ${funcao} cadastrado com sucesso!`);

            res.status(201).json({
                success: true,
                message: `${funcao === 'admin' ? 'Administrador' : 'Segurança'} cadastrado com sucesso!`,
                admin: {
                    id: novoAdmin._id,
                    nome: novoAdmin.nome,
                    funcao: novoAdmin.funcao
                }
            });

        } catch (error) {
            console.error(`Erro no cadastro: `, error);
            
            // Tratar erro de duplicação do MongoDB
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Administrador com este nome já existe!'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
    
}

export default new AdminController();