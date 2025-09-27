import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import { gerarAccessToken, verificarRefreshToken, definirTokens, removerTokens, gerarRefreshToken } from '../config/jwtConfig.js';


async function verificarSenha(senhaInformada, senhaArmazenada) {
    return await bcrypt.compare(senhaInformada, senhaArmazenada);
}

async function criptografarSenha(senha) {
    const saltRounds = 12;
    return await bcrypt.hash(senha, saltRounds);
}

// Função para validar funções dos ADMs a serem cadastrados
function validarFuncao(funcao) {
    const funcoesValidas = ['admin', 'seguranca'];
    return funcoesValidas.includes(funcao.toLowerCase());
}

export async function cadastrarDesenvolvedor() { // Cadastrando o usuário desenvolvedor quando o back-end é iniciado
    try {
        const devNome = process.env.DEV_USER_NOME || 'Lucas Gomes';
        const devSenha = process.env.DEV_USER_SENHA || 'lucasgomes';
        const devFuncao = 'desenvolvedor';

        const devExistente = await Admin.findOne({ nome: devNome.toLowerCase() });

        if (!devExistente) {
            console.log(`Usuário '${devNome}' não encontrado. Criando...`);
            
            const senhaCriptografada = await criptografarSenha(devSenha);

            const novoDev = new Admin({
                nome: devNome,
                senha: senhaCriptografada,
                funcao: devFuncao
            });

            await novoDev.save();
            console.log(`Usuário '${devNome}' criado com sucesso!`);
        } else {
            console.log(`Usuário '${devNome}' já existe. Nenhuma ação necessária.`);
        }

    } catch (error) {
        console.error("Erro ao tentar criar o usuário desenvolvedor. O desenvolvedor já foi cadastrado ou um erro desconhecido aconteceu: ", error);
        // Interrompe o processo em caso de erro. 
        // Está apontando erro pois foi configurado no model para existir apenas um usuário do tipo 'desenvolvedor' na collection admins
        // process.exit(1); Descomentar em produção para segurança do back-end
    }
}

class AdminController {

    // Método de login gerando o token JWT
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
                    message: `Admin ${nome} não encontrado!`
                });
            }

            const senhaCorreta = await verificarSenha(senha, admin.senha);

            if (!senhaCorreta) {
                return res.status(401).json({
                    success: false,
                    message: `Senha do admin incorreta!`
                });
            }

            // Gerar token JWT
            const payload = {
                id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao
            };

            const accessToken = gerarAccessToken(payload);
            const refreshToken = gerarRefreshToken(payload);

            definirTokens(res, accessToken, refreshToken); // Define o cookie com o token JWT

            // Atualizar último login
            await Admin.findByIdAndUpdate(admin._id, { 
                ultimoLogin: new Date() 
            });

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

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token não fornecido" });
        }

        const payload = verificarRefreshToken(refreshToken);

        if (!payload) {
            removerTokens(res);
            return res.status(403).json({ message: "Refresh token inválido" });
        }

        const newAccessToken = gerarAccessToken({
            id: payload.id,
            email: payload.email,
            tipo: payload.tipo
        });

        res.cookie('jwt', newAccessToken, accessTokenConfig);
        res.json({ message: "Token atualizado com sucesso" });
    };

    async logout(req, res) {
        try {
            removerTokens(res);
            return res.status(200).json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
        } catch (error) {
            console.error('Erro no logout:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async cadastrarAdmin(req, res) {
        try {
            const { nome, senha, funcao } = req.body;

            if (req.usuario.funcao !== 'super-usuario' && req.usuario.funcao !== 'desenvolvedor') {
                return res.status(403).json({
                    success: false,
                    message: 'Apenas o super-adm ou o desenvolvedor pode cadastrar novos admistradores e seguranças!'
                });
            }

            if (!nome || !senha || !funcao) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, senha e função são obrigatórios!'
                });
            }

            // Validar função a ser cadastrada (só pode ser 'admin' ou 'segurança')
            if (!validarFuncao(funcao)) {
                return res.status(400).json({
                    success: false,
                    message: 'Função deve ser "admin" ou "seguranca"!'
                });
            }

            const nomeValido = nome;
            const adminExistente = await Admin.findOne({ nome: nomeValido });

            if (adminExistente) {
                return res.status(409).json({
                    success: false,
                    message: 'Já existe um administrador com este nome!'
                });
            }

            if (senha.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha deve ter no mínimo 8 caracteres!'
                });
            }

            const senhaCriptografada = await criptografarSenha(senha);

            const novoAdmin = new Admin({
                nome,
                senha: senhaCriptografada,
                funcao: funcao.toLowerCase()
            });

            await novoAdmin.save();

            console.log(`Admin ${nome} de função ${funcao} cadastrado com sucesso por ${req.usuario.nome}!`);

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

    // Método para verificar token
    async verificarAutenticacao(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Token válido',
                admin: {
                    id: req.usuario.id,
                    nome: req.usuario.nome,
                    funcao: req.usuario.funcao
                }
            });
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async listarAdmins(req, res) {
        try {
            const admins = await Admin.find()
                .select('_id nome funcao createdAt updatedAt')
                .sort({ createdAt: -1 }); // Ordenar por data de criação (mais recente primeiro)
            
            // Mapear para o formato esperado pelo frontend
            const adminsFormatados = admins.map(admin => ({
                _id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao,
                dataCadastro: admin.createdAt,
                dataAtualizacao: admin.updatedAt
            }));
            
            res.json(adminsFormatados);

        } catch (err) {
            console.error('Erro ao listar admins:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async removerAdmins(req, res) {
        const { nome } = req.params;

        // Não se pode remover sua própria conta
        if (req.usuario.nome === nome) {
            return res.status(403).json({
                success: false,
                message: 'Você não pode remover sua própria conta!'
            });
        }

        if (req.usuario.funcao !== 'super-usuario' && req.usuario.funcao !== 'desenvolvedor') {
            return res.status(403).json({
                success: false,
                message: 'Apenas o super-usuario pode remover Adms ou Seguranças!'
            });
        }

        const admin = await Admin.findOneAndDelete({ nome });

        if (!admin) {
            return res.status(404).json({ error: `${nome} não encontrado!` });
        }

        console.log(`${nome} removido com sucesso do C.E.R.F`);

        res.json({
            success: true,
            message: `${nome} removido com sucesso do C.E.R.F`,
            admin: {
                id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao
            }
        });
    }

}

export default new AdminController();