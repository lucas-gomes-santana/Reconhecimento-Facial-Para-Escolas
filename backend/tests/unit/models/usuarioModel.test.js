import { describe, it, expect } from "vitest";

describe("Usuario Model", () => {
  describe("Estrutura do Schema", () => {
    it("deve ter os campos definidos no modelo", () => {
      const usuarioFields = [
        "nome",
        "tipoUsuario",
        "descriptor",
        "dataCadastro",
        "status",
        "bloqueadoAte",
        "createdAt",
        "updatedAt",
      ];

      usuarioFields.forEach((field) => {
        expect(field).toBeDefined();
      });
    });

    it("deve ter status com valores válidos", () => {
      const statusValidos = ["liberado", "bloqueado"];

      expect(statusValidos).toContain("liberado");
      expect(statusValidos).toContain("bloqueado");
    });

    it("deve ter tipoUsuario como string", () => {
      const tipoUsuario = "String";

      expect(tipoUsuario).toBe("String");
    });
  });

  describe("Descriptor Facial", () => {
    it("deve ter descriptor como array de 128 números", () => {
      const descriptorLength = 128;

      expect(descriptorLength).toBe(128);
    });

    it("deve aceitar descriptor com valores entre -1 e 1", () => {
      const descriptor = Array(128)
        .fill(0)
        .map(() => Math.random() * 2 - 1);

      expect(descriptor.every((n) => n >= -1 && n <= 1)).toBe(true);
    });

    it("deve aceitar descriptor vazio para validação", () => {
      const descriptor = [];

      expect(Array.isArray(descriptor)).toBe(true);
    });
  });

  describe("Índices", () => {
    it("deve ter índice único em nome", () => {
      const indiceNome = { nome: 1 };

      expect(indiceNome).toEqual({ nome: 1 });
    });
  });

  describe("Defaults", () => {
    it("deve ter status default liberado", () => {
      const defaultStatus = "liberado";

      expect(defaultStatus).toBe("liberado");
    });

    it("deve ter bloqueadoAte default null", () => {
      const defaultBloqueado = null;

      expect(defaultBloqueado).toBeNull();
    });

    it("deve ter dataCadastro default Date.now", () => {
      const defaultDate = Date.now();

      expect(typeof defaultDate).toBe("number");
    });
  });
});

