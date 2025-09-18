import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import { gerarToken } from '../config/jwtConfig.js';

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

    // Método de login COM JWT
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

            // Gerar token JWT
            const tokenPayload = {
                id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao
            };

            const token = gerarToken(tokenPayload);

            // Atualizar último login
            await Admin.findByIdAndUpdate(admin._id, { 
                ultimoLogin: new Date() 
            });

            // Retorna resposta 200 com token
            return res.status(200).json({
                success: true,
                message: 'Admin encontrado e autenticado',
                token: token,
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

    // Método de cadastro de admins (PROTEGIDA - só admin pode cadastrar)
    async cadastrarAdmin(req, res) {
        try {
            const { nome, senha, funcao } = req.body;

            // Verificar se o usuário autenticado é admin
            if (req.usuario.funcao !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Apenas administradores podem cadastrar novos usuários!'
                });
            }

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

            const nomeValido = nome.toLowerCase();

            // Verificar se nome já existe
            const adminExistente = await Admin.findOne({ nome: nomeValido });

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
            // Se chegou até aqui, o token é válido
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

    // Método de listar admins
    async listarAdmins(req, res) {
        try {
            const admins = await Admin.find().select('_id nome funcao createdAt');
            
            // Mapear para o formato esperado pelo frontend
            const adminsFormatados = admins.map(admin => ({
                _id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao,
                dataCadastro: admin.createdAt // Usar createdAt como dataCadastro
            }));
            
            res.json(adminsFormatados);
        } catch (err) {
            console.error('Erro ao listar admins:', err);
            res.status(500).json({ error: err.message });
        }
    }

    // Remover admins do sistema por nome
    async removerAdmins(req, res) {
        const { nome, funcao } = req.params;

        // Verificar se o usuário autenticado é admin
        if (req.usuario.funcao !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Apenas administradores podem cadastrar novos usuários!'
            });
        }

        const admin = await Admin.findOneAndDelete({ nome: decodeURIComponent(nome) });
        
        if (!admin) {
            return res.status(404).json({ error: `Admin ${nome} não encontrado!` });
        }

        console.log(`${funcao === 'admin' ? 'Administrador' : 'Segurança'} ${nome} removido com sucesso`);

        res.json({
            success: true,
            message: `${funcao === 'admin' ? 'Administrador' : 'Segurança'} removido com sucesso`,
            admin: {
                id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao
            }
        });

    }
}

export default new AdminController();