import { describe, it, expect } from "vitest";
import { criptografarSenha, validarSenha, validarFuncaoCadastrada } from "../../../utils/utils.js";

describe("Utils", () => {
  describe("criptografarSenha", () => {
    it("deve retornar uma string hash", async () => {
      const hash = await criptografarSenha("senha123");
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(20);
    });

    it("deve gerar hashes diferentes para mesma senha (salt único)", async () => {
      const hash1 = await criptografarSenha("senha123");
      const hash2 = await criptografarSenha("senha123");
      expect(hash1).not.toBe(hash2);
    });

    it("deve gerar hash válido para senha vazia", async () => {
      const hash = await criptografarSenha("");
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe("validarSenha", () => {
    it("deve retornar true para senha correta", async () => {
      const hash = await criptografarSenha("senha123");
      const resultado = await validarSenha("senha123", hash);
      expect(resultado).toBe(true);
    });

    it("deve retornar false para senha incorreta", async () => {
      const hash = await criptografarSenha("senha123");
      const resultado = await validarSenha("senha456", hash);
      expect(resultado).toBe(false);
    });

    it("deve retornar false para hash inválido", async () => {
      const resultado = await validarSenha("senha123", "hash_invalido");
      expect(resultado).toBe(false);
    });

    it("deve funcionar com senhas longas", async () => {
      const senhaLonga = "a".repeat(100);
      const hash = await criptografarSenha(senhaLonga);
      const resultado = await validarSenha(senhaLonga, hash);
      expect(resultado).toBe(true);
    });
  });

  describe("validarFuncaoCadastrada", () => {
    it('deve retornar true para "admin"', () => {
      expect(validarFuncaoCadastrada("admin")).toBe(true);
    });

    it('deve retornar true para "seguranca"', () => {
      expect(validarFuncaoCadastrada("seguranca")).toBe(true);
    });

    it('deve retornar true para "super-admin"', () => {
      expect(validarFuncaoCadastrada("super-admin")).toBe(true);
    });

    it("deve retornar false para função inválida", () => {
      expect(validarFuncaoCadastrada("invalida")).toBe(false);
    });

    it("deve ser case insensitive (ADMIN)", () => {
      expect(validarFuncaoCadastrada("ADMIN")).toBe(true);
    });

    it("deve ser case insensitive (Super-Admin)", () => {
      expect(validarFuncaoCadastrada("Super-Admin")).toBe(true);
    });

    it("deve retornar false para string vazia", () => {
      expect(validarFuncaoCadastrada("")).toBe(false);
    });

    it("deve lançar erro para valor null", () => {
      expect(() => validarFuncaoCadastrada(null)).toThrow();
    });

    it("deve lançar erro para valor undefined", () => {
      expect(() => validarFuncaoCadastrada(undefined)).toThrow();
    });

    it('deve retornar false para "desenvolvedor" (não permitido via função)', () => {
      expect(validarFuncaoCadastrada("desenvolvedor")).toBe(false);
    });
  });
});
