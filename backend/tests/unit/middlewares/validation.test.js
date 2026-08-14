import { describe, it, expect, beforeEach, vi } from "vitest";
import ValidationMiddleware from "../../../middlewares/validation.ts";

describe("ValidationMiddleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { body: {}, params: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe("validateLogin", () => {
    it("deve chamar next() quando nome e senha presentes", () => {
      mockReq.body = { nome: "admin", senha: "12345678" };

      ValidationMiddleware.validateLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando nome ausente", () => {
      mockReq.body = { senha: "12345678" };

      ValidationMiddleware.validateLogin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Todos os campos são obrigatórios" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando senha ausente", () => {
      mockReq.body = { nome: "admin" };

      ValidationMiddleware.validateLogin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando ambos ausentes", () => {
      mockReq.body = {};

      ValidationMiddleware.validateLogin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateCadastroUsuario", () => {
    it("deve chamar next() quando dados válidos", () => {
      mockReq.body = {
        nome: "João Silva",
        tipoUsuario: "Aluno",
        descriptor: [0.1, 0.2, 0.3],
      };

      ValidationMiddleware.validateCadastroUsuario(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve retornar 400 quando nome ausente", () => {
      mockReq.body = { tipoUsuario: "Aluno", descriptor: [0.1] };

      ValidationMiddleware.validateCadastroUsuario(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando tipoUsuario ausente", () => {
      mockReq.body = { nome: "João", descriptor: [0.1] };

      ValidationMiddleware.validateCadastroUsuario(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("deve retornar 400 quando descriptor ausente", () => {
      mockReq.body = { nome: "João", tipoUsuario: "Aluno" };

      ValidationMiddleware.validateCadastroUsuario(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("validateVerificacaoRosto", () => {
    it("deve chamar next() com descriptor válido", () => {
      mockReq.body = { descriptor: [0.1, 0.2], contexto: "verificacao" };

      ValidationMiddleware.validateVerificacaoRosto(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    // Ponto de atenção para revisar futuramente: o contexto está sendo passado como opcional
    // Talvez seja interessante passar o contexto como obrigatório para evitar confusões ou como segurança adicional
    it("deve chamar next() sem contexto (opcional)", () => {
      mockReq.body = { descriptor: [0.1, 0.2] };

      ValidationMiddleware.validateVerificacaoRosto(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve retornar 400 quando descriptor ausente", () => {
      mockReq.body = { contexto: "verificacao" };

      ValidationMiddleware.validateVerificacaoRosto(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(Array) }),
      );
    });

    it("deve retornar 400 quando descriptor não é array", () => {
      mockReq.body = { descriptor: "não é array" };

      ValidationMiddleware.validateVerificacaoRosto(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("deve retornar 400 para contexto inválido", () => {
      mockReq.body = { descriptor: [0.1], contexto: "invalido" };

      ValidationMiddleware.validateVerificacaoRosto(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('deve aceitar contexto "cadastro"', () => {
      mockReq.body = { descriptor: [0.1], contexto: "cadastro" };

      ValidationMiddleware.validateVerificacaoRosto(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('deve aceitar contexto "merenda"', () => {
      mockReq.body = { descriptor: [0.1], contexto: "merenda" };

      ValidationMiddleware.validateVerificacaoRosto(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("validateCadastroAdmin", () => {
    it("deve chamar next() com dados válidos", () => {
      mockReq.body = { nome: "admin", senha: "12345678", funcao: "admin" };

      ValidationMiddleware.validateCadastroAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve retornar 400 quando senha < 8 caracteres", () => {
      mockReq.body = { nome: "admin", senha: "1234567", funcao: "admin" };

      ValidationMiddleware.validateCadastroAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(Array) }),
      );
    });

    it("deve retornar 400 quando senha = 8 caracteres (mínimo)", () => {
      mockReq.body = { nome: "admin", senha: "12345678", funcao: "admin" };

      ValidationMiddleware.validateCadastroAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve retornar 400 quando senha é vazia", () => {
      mockReq.body = { nome: "admin", senha: "", funcao: "admin" };

      ValidationMiddleware.validateCadastroAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("validateIdParam", () => {
    it("deve chamar next() quando id presente nos params", () => {
      mockReq.params = { id: "123abc" };

      ValidationMiddleware.validateIdParam(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve retornar 400 quando id ausente", () => {
      mockReq.params = {};

      ValidationMiddleware.validateIdParam(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateMudancaDeSenha", () => {
    it("deve chamar next() com dados válidos", () => {
      mockReq.body = { id: "123", novaSenha: "12345678", confirmarSenha: "12345678" };

      ValidationMiddleware.validateMudancaDeSenha(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve retornar 400 quando senhas não conferem", () => {
      mockReq.body = { id: "123", novaSenha: "12345678", confirmarSenha: "87654321" };

      ValidationMiddleware.validateMudancaDeSenha(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando novaSenha < 8 caracteres", () => {
      mockReq.body = { id: "123", novaSenha: "1234567", confirmarSenha: "1234567" };

      ValidationMiddleware.validateMudancaDeSenha(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("deve retornar 400 quando id ausente", () => {
      mockReq.body = { novaSenha: "12345678", confirmarSenha: "12345678" };

      ValidationMiddleware.validateMudancaDeSenha(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
