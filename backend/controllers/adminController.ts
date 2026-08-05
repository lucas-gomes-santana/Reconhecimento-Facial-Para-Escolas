import type { Request, Response } from "express";
import {
  gerarAccessToken,
  verificarRefreshToken,
  definirTokens,
  removerTokens,
  gerarRefreshToken,
} from "../config/jwtConfig.ts";
import { criptografarSenha, validarFuncaoCadastrada, validarSenha } from "../utils/utils.js";
import type { IAdmin } from "../models/Admin.ts";

export async function cadastrarDesenvolvedor(Admin: import("mongoose").Model<IAdmin>) {
  const devNome = process.env.DEV_USER_NOME || "admin";
  const devSenha = process.env.DEV_USER_SENHA || "admin";
  const devFuncao = "desenvolvedor";

  const devExistente = await Admin.findOne({ nome: devNome });

  if (!devExistente) {
    console.log(`Usuário '${devNome}' não encontrado. Criando...`);

    const senhaCriptografada = await criptografarSenha(devSenha);

    const novoDev = new Admin({
      nome: devNome,
      senha: senhaCriptografada,
      funcao: devFuncao,
    });

    await novoDev.save();
    console.log(`Usuário '${devNome}' criado com sucesso!`);
  } else {
    console.log(`Usuário '${devNome}' já existe. Nenhuma ação necessária.`);
  }
}

export class AdminController {
  private Admin: import("mongoose").Model<IAdmin>;

  constructor(adminModel: import("mongoose").Model<IAdmin>) {
    this.Admin = adminModel;
  }

  async login(req: Request, res: Response) {
    const { nome, senha } = req.body;

    const admin = await this.Admin.findOne({ nome: nome });

    if (!admin) {
      return res.status(404).json({ message: `Gestor ${nome} não encontrado` });
    }

    const senhaCorreta = await validarSenha(senha, admin.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // Gerar token JWT
    const payload = {
      id: admin._id.toString(),
      nome: admin.nome,
      funcao: admin.funcao,
    };

    const accessToken = gerarAccessToken(payload);
    const refreshToken = gerarRefreshToken(payload);

    definirTokens(res, accessToken, refreshToken);

    await this.Admin.findByIdAndUpdate(admin._id, {
      ultimoLogin: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Admin encontrado e autenticado",
      admin: {
        id: admin._id,
        nome: admin.nome,
        funcao: admin.funcao,
      },
    });
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token não fornecido" });
    }

    const payload = verificarRefreshToken(refreshToken);

    if (!payload) {
      removerTokens(res);
      return res.status(403).json({ message: "Refresh token inválido ou expirado" });
    }

    const newAccessToken = gerarAccessToken({
      id: payload.id,
      nome: payload.nome,
      funcao: payload.funcao,
    });

    const newRefreshToken = gerarRefreshToken({
      id: payload.id,
      nome: payload.nome,
      funcao: payload.funcao,
    });

    definirTokens(res, newAccessToken, newRefreshToken);

    console.log(`Tokens renovados para ${payload.nome}`);

    res.json({
      success: true,
      message: "Tokens atualizados com sucesso",
    });
  }

  async logout(req: Request, res: Response) {
    try {
      removerTokens(res);
      return res.status(200).json({
        success: true,
        message: "Logout realizado com sucesso",
      });
    } catch (error) {
      console.error("Erro no logout:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async cadastrarAdmin(req: Request, res: Response) {
    const { nome, senha, funcao } = req.body;

    if (req.usuario!.funcao !== "super-admin" && req.usuario!.funcao !== "desenvolvedor") {
      return res.status(401).json({
        message:
          "Apenas o super-admin ou o desenvolvedor podem cadastrar novos admins e seguranças.",
      });
    }

    if (!validarFuncaoCadastrada(funcao)) {
      return res.status(400).json({ message: `Função ${funcao} inválida!` });
    }

    const nomeValido = nome;
    const adminExistente = await this.Admin.findOne({ nome: nomeValido });

    if (adminExistente) {
      return res.status(409).json({ message: `O gestor ${nome} já existe no sistema` });
    }

    const senhaCriptografada = await criptografarSenha(senha);

    const novoAdmin = new this.Admin({
      nome,
      senha: senhaCriptografada,
      funcao: funcao.toLowerCase(),
    });

    await novoAdmin.save();

    console.log(
      `Gestor ${nome} de função ${funcao} cadastrado com sucesso por ${req.usuario!.nome}!`,
    );

    res.status(201).json({
      success: true,
      message:
        funcao === "admin"
          ? "Administrador cadastrado com sucesso!"
          : "Segurança cadastrado com sucesso!",
      admin: {
        id: novoAdmin._id,
        nome: novoAdmin.nome,
        funcao: novoAdmin.funcao,
      },
    });
  }

  async cadastrarSuperAdmin(req: Request, res: Response) {
    const { nome, senha, funcao } = req.body;

    if (req.usuario!.funcao !== "desenvolvedor") {
      return res.status(403).json({
        message: "Apenas o desenvolvedor pode cadastrar o super-admin",
      });
    }

    if (!validarFuncaoCadastrada(funcao)) {
      return res.status(400).json({ message: `Função ${funcao} inválida` });
    }

    const superAdminExistente = await this.Admin.findOne({
      funcao: "super-admin",
    });

    if (superAdminExistente) {
      return res.status(409).json({
        message: "Já existe um Super-Admin cadastrado no sistema",
      });
    }

    const senhaCriptografada = await criptografarSenha(senha);

    const novoSuperAdmin = new this.Admin({
      nome,
      senha: senhaCriptografada,
      funcao: funcao.toLowerCase(),
    });

    await novoSuperAdmin.save();
    console.log(`Super-Admin ${nome} cadastrado com sucesso`);

    res.status(201).json({
      success: true,
      message: `Super-Admin ${nome} cadastrado com sucesso`,
    });
  }

  async atualizarSenha(req: Request, res: Response) {
    const { id, novaSenha } = req.body;

    const admin = await this.Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "Gestor não encontrado" });
    }

    if (
      req.usuario!.funcao !== "super-admin" &&
      req.usuario!.funcao !== "desenvolvedor" &&
      req.usuario!.id !== id
    ) {
      return res.status(403).json({
        message: "Você não tem permissão para alterar senha de outro usuário!",
      });
    }

    const novaSenhaCriptografada = await criptografarSenha(novaSenha);

    admin.senha = novaSenhaCriptografada;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  }

  async verificarAutenticacao(req: Request, res: Response) {
    try {
      res.status(200).json({
        success: true,
        message: "Token válido",
        admin: {
          id: req.usuario!.id,
          nome: req.usuario!.nome,
          funcao: req.usuario!.funcao,
        },
      });
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  }

  async listarAdmins(req: Request, res: Response) {
    try {
      const admins = await this.Admin.find()
        .select("_id nome funcao createdAt updatedAt")
        .sort({ createdAt: -1 }); // Ordenar por data de criação (mais recente primeiro)

      // Mapear para o formato esperado pelo frontend
      const adminsFormatados = admins.map((admin) => ({
        _id: admin._id,
        nome: admin.nome,
        funcao: admin.funcao,
        dataCadastro: admin.createdAt,
        dataAtualizacao: admin.updatedAt,
      }));

      res.json(adminsFormatados);
    } catch (err) {
      console.error("Erro ao listar admins:", err);
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async removerAdmins(req: Request, res: Response) {
    const { id } = req.params;

    if (req.usuario!.funcao !== "super-admin" && req.usuario!.funcao !== "desenvolvedor") {
      return res.status(403).json({
        message: "Apenas o super-admin pode remover Admins ou Seguranças!",
      });
    }

    if (req.usuario!.id.toString() === id.toString()) {
      return res.status(403).json({ message: "Você não pode remover sua própria conta!" });
    }

    const admin = await this.Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(400).json({ message: "Gestor não encontrado!" });
    }

    console.log(`Gestor ${admin.nome} removido com sucesso do C.E.R.F`);

    res.json({
      success: true,
      message: `Gestor ${admin.nome} removido com sucesso do C.E.R.F`,
      adminRemovido: {
        id: admin._id,
        nome: admin.nome,
        funcao: admin.funcao,
        dataRemocao: new Date(),
      },
    });
  }
}
