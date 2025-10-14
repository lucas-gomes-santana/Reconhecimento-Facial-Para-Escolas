import Admin from '../models/Admin.js';
import { gerarAccessToken, verificarRefreshToken, definirTokens, removerTokens, gerarRefreshToken } from '../config/jwtConfig.js';
import { criptografarSenha, validarFuncaoCadastrada, validarSenha } from '../utils/utils.js';
import { AlreadyExistsException, InvalidFunctionException, NotFoundException, PermissionDeniedException } from '../exceptions/AppExceptions.js';


export async function cadastrarDesenvolvedor() { // Cadastrando o usuário desenvolvedor quando o back-end é iniciado
    // Remover o fallback em produção
    const devNome = process.env.DEV_USER_NOME || 'Lucas Gomes';
    const devSenha = process.env.DEV_USER_SENHA || 'lucasgomes';
    const devFuncao = 'desenvolvedor';

    const devExistente = await Admin.findOne({ nome: devNome });

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
}

class AdminController {

    async login(req, res) {
        const { nome, senha } = req.body;

        const admin = await Admin.findOne({ nome: nome });

        if (!admin) {
            throw new NotFoundException(`Admin ${nome} não encontrado!`)
;       }

        const senhaCorreta = await validarSenha(senha, admin.senha);

        if (!senhaCorreta) {
            throw new PermissionDeniedException(`Senha do admin incorreta!`);
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
        const { nome, senha, funcao } = req.body;

        if (req.usuario.funcao !== 'super-admin' && req.usuario.funcao !== 'desenvolvedor') {
            throw new PermissionDeniedException('Apenas o super-admin ou o desenvolvedor podem cadastrar novos admins e seguranças.')
        }

        if (!validarFuncaoCadastrada(funcao)) {
            throw new InvalidFunctionException(`Função ${funcao} inválida`);
        }

        const nomeValido = nome;
        const adminExistente = await Admin.findOne({ nome: nomeValido });

        if (adminExistente) {
            throw new AlreadyExistsException(`O gestor ${nome} já existe no sistema`);
        }

        const senhaCriptografada = await criptografarSenha(senha);

        const novoAdmin = new Admin({
            nome,
            senha: senhaCriptografada,
            funcao: funcao.toLowerCase()
        });

        await novoAdmin.save();

        console.log(`Gestor ${nome} de função ${funcao} cadastrado com sucesso por ${req.usuario.nome}!`);

        res.status(201).json({
            success: true,
            message: `${funcao === 'admin' ? 'Administrador' : 'Segurança'} cadastrado com sucesso!`,
            admin: {
                id: novoAdmin._id,
                nome: novoAdmin.nome,
                funcao: novoAdmin.funcao
            }
        });
    }

    async cadastrarSuperAdmin(req, res) {
        const { nome, senha, funcao } = req.body;

        if (req.usuario.funcao !== 'desenvolvedor') {
            throw new PermissionDeniedException('Apenas o desenvolvedor pode cadastrar o super-admin');
        }

        if (!validarFuncaoCadastrada(funcao)) {
            throw new InvalidFunctionException(`Função ${funcao} inválida`);
        }

        const superAdminExistente = await Admin.findOne({
            funcao: 'super-admin'
        })

        if (superAdminExistente) {
            throw new AlreadyExistsException('Já existe um Super-Admin cadastrado no sistema');
        }

        const senhaCriptografada = await criptografarSenha(senha);

        const novoSuperAdmin = new Admin({
            nome,
            senha: senhaCriptografada,
            funcao: funcao.toLowerCase()
        });

        await novoSuperAdmin.save();
        console.log(`Super-Admin ${nome} cadastrado com sucesso`);

        res.status(201).json({
            success: true,
            message: `Super-Admin ${nome} cadastrado com sucesso`,
        });
    }

    async atualizarSenha(req, res) {
        const { id, novaSenha } = req.body;

        const admin = await Admin.findById(id);

        if (!admin) {
            throw new NotFoundException(`Gestor ${admin.nome} não encontrado`);
        }

        if (req.usuario.funcao !== 'super-admin' && req.usuario.funcao !== 'desenvolvedor' && req.usuario.id !== id){
            throw new PermissionDeniedException('Você não tem permissão para alterar senha de outro usuário!');
        }

        const novaSenhaCriptografada = await criptografarSenha(novaSenha);

        admin.senha = novaSenhaCriptografada;
        await admin.save();

        return res.status(200).json({
            success: true,
            message: 'Senha alterada com sucesso'
        }); 
    }

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
                error: 'Erro interno do servidor'
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
        const { id } = req.params;

        if (req.usuario.funcao !== 'super-usuario' && req.usuario.funcao !== 'desenvolvedor') {
            throw new PermissionDeniedException('Apenas o super-admin pode remover Adms ou Seguranças!');
        }

        if (req.usuario.id.toString() === id.toString()) {
            throw new PermissionDeniedException('Você não pode remover sua própria conta!');
        }

        const admin = await Admin.findByIdAndDelete(id);
        
        if (!admin) {
            throw new NotFoundException(`Gestor ${admin.nome} não encontrado!`);
        }

        console.log(`Gestor ${admin.nome} removido com sucesso do C.E.R.F`);
        
        res.json({
            success: true,
            message: `Gestor ${admin.nome} removido com sucesso do C.E.R.F`,
            adminRemovido: {
                id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao,
                dataRemocao: new Date()
            }
        });
          
    }

}

export default new AdminController();