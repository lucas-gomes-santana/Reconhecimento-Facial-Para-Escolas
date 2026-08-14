import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  gerarAccessToken,
  gerarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
  autenticarToken,
  type TokenPayload,
} from "../../../config/jwtConfig.ts";

describe("JWT Config", () => {
  const payloadValido: TokenPayload = {
    id: "123abc",
    nome: "teste",
    funcao: "admin",
  };

  describe("gerarAccessToken", () => {
    it("deve gerar um token de acesso válido", () => {
      const token = gerarAccessToken(payloadValido);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("deve gerar token contendo o payload", () => {
      const token = gerarAccessToken(payloadValido);
      const decoded = verificarAccessToken(token);
      expect(decoded.id).toBe("123abc");
      expect(decoded.nome).toBe("teste");
      expect(decoded.funcao).toBe("admin");
    });

    it("deve gerar token com header, payload e signature", () => {
      const token = gerarAccessToken(payloadValido);
      const parts = token.split(".");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    });
  });

  describe("gerarRefreshToken", () => {
    it("deve gerar um token de refresh válido", () => {
      const token = gerarRefreshToken(payloadValido);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("deve gerar token contendo o payload", () => {
      const token = gerarRefreshToken(payloadValido);
      const decoded = verificarRefreshToken(token);
      expect(decoded.nome).toBe("teste");
    });
  });

  describe("verificarAccessToken", () => {
    it("deve retornar payload para token válido", () => {
      const token = gerarAccessToken(payloadValido);
      const resultado = verificarAccessToken(token);
      expect(resultado).not.toBeNull();
      expect(resultado.id).toBe("123abc");
    });

    it("deve retornar null para token inválido", () => {
      const resultado = verificarAccessToken("token.invalido");
      expect(resultado).toBeNull();
    });

    it("deve retornar null para token vazio", () => {
      const resultado = verificarAccessToken("");
      expect(resultado).toBeNull();
    });
  });

  describe("verificarRefreshToken", () => {
    it("deve retornar payload para token válido", () => {
      const token = gerarRefreshToken(payloadValido);
      const resultado = verificarRefreshToken(token);
      expect(resultado).not.toBeNull();
    });

    it("deve retornar null para token inválido", () => {
      const resultado = verificarRefreshToken("token.invalido");
      expect(resultado).toBeNull();
    });
  });

  describe("autenticarToken middleware", () => {
    let mockReq: Request;
    let mockRes: Response;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = { cookies: {} } as Request;
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      mockNext = vi.fn() as unknown as NextFunction;
    });

    it("deve chamar next() quando token presente e válido", () => {
      const token = gerarAccessToken(payloadValido);
      mockReq.cookies = { jwt: token };

      autenticarToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.usuario).toBeDefined();
      expect(mockReq.usuario.id).toBe("123abc");
    });

    it("deve retornar 401 quando token ausente", () => {
      mockReq.cookies = {};

      autenticarToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Token não fornecido" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve retornar 403 quando token inválido", () => {
      mockReq.cookies = { jwt: "token.invalido" };

      autenticarToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Token inválido" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("deve chamar next() e definir req.usuario com payload decodificado", () => {
      const token = gerarAccessToken(payloadValido);
      mockReq.cookies = { jwt: token };

      autenticarToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.usuario).toEqual(
        expect.objectContaining({
          id: "123abc",
          nome: "teste",
          funcao: "admin",
        }),
      );
    });
  });
});
