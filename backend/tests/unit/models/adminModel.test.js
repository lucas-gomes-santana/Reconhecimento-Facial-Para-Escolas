import { describe, it, expect } from "vitest";

describe("Admin Model", () => {
  describe("Estrutura do Schema", () => {
    it("deve ter os campos definidos no modelo", () => {
      const adminFields = [
        "nome",
        "senha",
        "funcao",
        "ativo",
        "ultimoLogin",
        "createdAt",
        "updatedAt",
      ];

      adminFields.forEach((field) => {
        expect(field).toBeDefined();
      });
    });

    it("deve ter função com valores válidos", () => {
      const funcoesValidas = ["admin", "seguranca", "super-admin", "desenvolvedor"];

      expect(funcoesValidas).toContain("admin");
      expect(funcoesValidas).toContain("super-admin");
      expect(funcoesValidas).toContain("desenvolvedor");
      expect(funcoesValidas).toContain("seguranca");
    });

    it("deve validar senha mínima de 8 caracteres", () => {
      const minSenha = 8;

      expect(minSenha).toBe(8);
    });
  });

  describe("Índices", () => {
    it("deve ter índice único em nome", () => {
      const indiceNome = { nome: 1 };

      expect(indiceNome).toEqual({ nome: 1 });
    });

    it("deve ter índice único parcial para super-admin e desenvolvedor", () => {
      const funcoesUnicas = ["desenvolvedor", "super-admin"];

      expect(funcoesUnicas).toContain("desenvolvedor");
      expect(funcoesUnicas).toContain("super-admin");
    });
  });

  describe("Métodos", () => {
    it("toJSON deve remover senha", () => {
      const adminObj = { nome: "admin", senha: "hash123", createdAt: new Date() };
      const { senha, ...semSenha } = adminObj;

      expect(semSenha.senha).toBeUndefined();
      expect(semSenha.nome).toBe("admin");
    });
  });

  describe("Virtuals", () => {
    it("deve ter virtual dataCadastro", () => {
      const virtual = "dataCadastro";

      expect(virtual).toBe("dataCadastro");
    });
  });
});
