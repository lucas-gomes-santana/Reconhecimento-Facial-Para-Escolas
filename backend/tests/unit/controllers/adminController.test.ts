import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { Request, Response } from "express";
import { AdminController } from "../../../controllers/adminController.ts";
import type { IAdmin } from "../../../models/Admin.ts";
import { adminMock, superAdminMock, desenvolvedorMock, adminInput } from "../../fixtures/admins.ts";
import {
  gerarAccessToken,
  definirTokens,
  removerTokens,
  verificarRefreshToken as verificarRefreshTokenReal,
} from "../../../config/jwtConfig.ts";
import type { TokenPayload } from "../../../config/jwtConfig.ts";
import {
  validarSenha as validarSenhaReal,
  validarFuncaoCadastrada as validarFuncaoCadastradaReal,
} from "../../../utils/utils.ts";

vi.mock("../../../config/jwtConfig.ts", () => ({
  gerarAccessToken: vi.fn(() => "access-token-mock"),
  gerarRefreshToken: vi.fn(() => "refresh-token-mock"),
  definirTokens: vi.fn(),
  removerTokens: vi.fn(),
  verificarRefreshToken: vi.fn(),
}));

vi.mock("../../../utils/utils.ts", () => ({
  criptografarSenha: vi.fn(() => Promise.resolve("hashed-password")),
  validarSenha: vi.fn(() => Promise.resolve(true)),
  validarFuncaoCadastrada: vi.fn((funcao: string) =>
    ["admin", "seguranca", "super-admin"].includes(funcao.toLowerCase()),
  ),
}));

const verificarRefreshToken = verificarRefreshTokenReal as unknown as Mock;
const validarSenha = validarSenhaReal as unknown as Mock;
const validarFuncaoCadastrada = validarFuncaoCadastradaReal as unknown as Mock;

interface MockAdminModel {
  findOne: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findByIdAndUpdate: ReturnType<typeof vi.fn>;
  findByIdAndDelete: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
}

describe("AdminController", () => {
  let controller: AdminController;
  let mockAdminModel: MockAdminModel;
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(() => {
    mockAdminModel = {
      findOne: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      find: vi.fn(),
    };
    controller = new AdminController(mockAdminModel as unknown as import("mongoose").Model<IAdmin>);

    mockReq = {
      body: {},
      params: {},
      cookies: {},
      usuario: {},
    } as unknown as Request;
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as Response;

    vi.clearAllMocks();
  });

  describe("login", () => {
    it("deve fazer login com sucesso", async () => {
      mockReq.body = { nome: "admin", senha: "senha123" };
      mockAdminModel.findOne.mockResolvedValue(adminMock);

      await controller.login(mockReq, mockRes);

      expect(mockAdminModel.findOne).toHaveBeenCalledWith({ nome: "admin" });
      expect(validarSenha).toHaveBeenCalledWith("senha123", adminMock.senha);
      expect(gerarAccessToken).toHaveBeenCalledWith({
        id: adminMock._id,
        nome: adminMock.nome,
        funcao: adminMock.funcao,
      });
      expect(definirTokens).toHaveBeenCalledWith(
        mockRes,
        "access-token-mock",
        "refresh-token-mock",
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          admin: expect.objectContaining({ nome: "admin", funcao: "admin" }),
        }),
      );
    });

    it("deve retornar 404 quando admin não existe", async () => {
      mockReq.body = { nome: "inexistente", senha: "senha123" };
      mockAdminModel.findOne.mockResolvedValue(null);

      await controller.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Gestor inexistente não encontrado" });
    });

    it("deve retornar 401 quando senha incorreta", async () => {
      mockReq.body = { nome: "admin", senha: "senhaerrada" };
      mockAdminModel.findOne.mockResolvedValue(adminMock);
      validarSenha.mockResolvedValueOnce(false);

      await controller.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Senha incorreta" });
    });
  });

  describe("refreshToken", () => {
    it("deve renovar tokens com refresh token válido", async () => {
      mockReq.cookies = { refreshToken: "valid-refresh-token" };
      const payload = { id: adminMock._id, nome: adminMock.nome, funcao: adminMock.funcao };
      verificarRefreshToken.mockReturnValue(payload);

      await controller.refreshToken(mockReq, mockRes);

      expect(verificarRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
      expect(definirTokens).toHaveBeenCalledWith(
        mockRes,
        "access-token-mock",
        "refresh-token-mock",
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Tokens atualizados com sucesso",
      });
    });

    it("deve retornar 401 quando refresh token ausente", async () => {
      mockReq.cookies = {};

      await controller.refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Refresh token não fornecido" });
    });

    it("deve retornar 403 e remover tokens quando refresh token inválido", async () => {
      mockReq.cookies = { refreshToken: "invalid-token" };
      verificarRefreshToken.mockReturnValue(null);

      await controller.refreshToken(mockReq, mockRes);

      expect(removerTokens).toHaveBeenCalledWith(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Refresh token inválido ou expirado" });
    });
  });

  describe("logout", () => {
    it("deve fazer logout com sucesso", async () => {
      await controller.logout(mockReq, mockRes);

      expect(removerTokens).toHaveBeenCalledWith(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Logout realizado com sucesso",
      });
    });
  });

  describe("cadastrarAdmin", () => {
    it("deve retornar 401 quando usuário não autorizado", async () => {
      mockReq.body = adminInput;
      mockReq.usuario = { funcao: "admin", nome: "admin" } as unknown as TokenPayload;

      await controller.cadastrarAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message:
          "Apenas o super-admin ou o desenvolvedor podem cadastrar novos admins e seguranças.",
      });
    });

    it("deve retornar 400 quando função inválida", async () => {
      mockReq.body = { nome: "teste", senha: "senha123", funcao: "invalida" };
      mockReq.usuario = { funcao: "desenvolvedor" } as unknown as TokenPayload;
      validarFuncaoCadastrada.mockReturnValueOnce(false);

      await controller.cadastrarAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Função invalida inválida!" });
    });

    it("deve retornar 409 quando admin já existe", async () => {
      mockReq.body = adminInput;
      mockReq.usuario = { funcao: "desenvolvedor" } as unknown as TokenPayload;
      mockAdminModel.findOne.mockResolvedValue(adminMock);

      await controller.cadastrarAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "O gestor novoadmin já existe no sistema",
      });
    });
  });

  describe("cadastrarSuperAdmin", () => {
    it("deve retornar 403 quando não é desenvolvedor", async () => {
      mockReq.body = { nome: "teste", senha: "senha123", funcao: "super-admin" };
      mockReq.usuario = { funcao: "admin" } as unknown as TokenPayload;

      await controller.cadastrarSuperAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Apenas o desenvolvedor pode cadastrar o super-admin",
      });
    });

    it("deve retornar 409 quando super-admin já existe", async () => {
      mockReq.body = { nome: "teste", senha: "senha123", funcao: "super-admin" };
      mockReq.usuario = { funcao: "desenvolvedor" } as unknown as TokenPayload;
      mockAdminModel.findOne.mockResolvedValue(superAdminMock);

      await controller.cadastrarSuperAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Já existe um Super-Admin cadastrado no sistema",
      });
    });
  });

  describe("atualizarSenha", () => {
    it("deve retornar 403 quando usuário tenta alterar senha de outro (não é admin)", async () => {
      mockReq.body = { id: "outro-id", novaSenha: "novasenha" };
      mockReq.usuario = {
        id: { toString: () => adminMock._id },
        funcao: "admin",
      } as unknown as TokenPayload;
      mockAdminModel.findById.mockResolvedValue(adminMock);

      await controller.atualizarSenha(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("deve permitir desenvolvedor alterar senha de outros", async () => {
      mockReq.body = { id: "outro-id", novaSenha: "novasenha" };
      mockReq.usuario = {
        id: { toString: () => desenvolvedorMock._id },
        funcao: "desenvolvedor",
      } as unknown as TokenPayload;
      const adminComSave = { ...adminMock, save: vi.fn().mockResolvedValue(true) };
      mockAdminModel.findById.mockResolvedValue(adminComSave);

      await controller.atualizarSenha(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("verificarAutenticacao", () => {
    it("deve retornar 200 com dados do admin", async () => {
      mockReq.usuario = { id: adminMock._id, nome: "admin", funcao: "admin" };

      await controller.verificarAutenticacao(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Token válido",
        admin: { id: adminMock._id, nome: "admin", funcao: "admin" },
      });
    });

    it("deve retornar 200 normalmente", async () => {
      mockReq.usuario = { id: adminMock._id, nome: "admin", funcao: "admin" };

      await controller.verificarAutenticacao(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Token válido",
        admin: { id: adminMock._id, nome: "admin", funcao: "admin" },
      });
    });
  });

  describe("listarAdmins", () => {
    it("deve listar admins com formatação", async () => {
      const admins = [adminMock, superAdminMock];
      mockAdminModel.find.mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockResolvedValue(admins),
        }),
      });

      await controller.listarAdmins(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([
        {
          _id: adminMock._id,
          nome: "admin",
          funcao: "admin",
          dataCadastro: adminMock.createdAt,
          dataAtualizacao: adminMock.updatedAt,
        },
        {
          _id: superAdminMock._id,
          nome: "superadmin",
          funcao: "super-admin",
          dataCadastro: superAdminMock.createdAt,
          dataAtualizacao: superAdminMock.updatedAt,
        },
      ]);
    });

    it("deve retornar erro 500 em caso de falha", async () => {
      mockAdminModel.find.mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockRejectedValue(new Error("Erro DB")),
        }),
      });

      await controller.listarAdmins(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("removerAdmins", () => {
    it("deve remover admin com sucesso (desenvolvedor)", async () => {
      mockReq.params = { id: adminMock._id };
      mockReq.usuario = {
        id: { toString: () => desenvolvedorMock._id },
        funcao: "desenvolvedor",
      } as unknown as TokenPayload;
      mockAdminModel.findByIdAndDelete.mockResolvedValue(adminMock);

      await controller.removerAdmins(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: `Gestor ${adminMock.nome} removido com sucesso do C.E.R.F`,
        adminRemovido: expect.objectContaining({
          id: adminMock._id,
          nome: adminMock.nome,
          funcao: adminMock.funcao,
        }),
      });
    });

    it("deve retornar 403 quando tenta remover sua própria conta", async () => {
      mockReq.params = { id: adminMock._id };
      mockReq.usuario = {
        id: { toString: () => adminMock._id },
        funcao: "desenvolvedor",
      } as unknown as TokenPayload;

      await controller.removerAdmins(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Você não pode remover sua própria conta!",
      });
    });

    it("deve retornar 403 quando usuário não é desenvolvedor", async () => {
      mockReq.params = { id: adminMock._id };
      mockReq.usuario = {
        id: { toString: () => "outro-id" },
        funcao: "admin",
      } as unknown as TokenPayload;

      await controller.removerAdmins(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it("deve encontrar admin antes de remover (comportamento interno)", async () => {
      mockReq.params = { id: adminMock._id };
      mockReq.usuario = {
        id: { toString: () => desenvolvedorMock._id },
        funcao: "desenvolvedor",
      } as unknown as TokenPayload;
      mockAdminModel.findByIdAndDelete.mockResolvedValue(adminMock);

      await controller.removerAdmins(mockReq, mockRes);

      expect(mockAdminModel.findByIdAndDelete).toHaveBeenCalledWith(adminMock._id);
    });
  });
});
