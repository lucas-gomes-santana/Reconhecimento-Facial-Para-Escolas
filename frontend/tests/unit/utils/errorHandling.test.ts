import { describe, it, expect } from "vitest";
import { handleApiError } from "../../../src/utils/errorHandling";

describe("handleApiError", () => {
  it("deve detectar erro de conexão fetch (TypeError)", () => {
    const error = new TypeError("Failed to fetch");
    const result = handleApiError(error);
    expect(result.status).toBe(0);
    expect(result.message).toContain("Não foi possível conectar ao servidor");
  });

  it("deve retornar Error original quando não é erro de fetch", () => {
    const error = new Error("Erro de negócio");
    const result = handleApiError(error);
    expect(result).toBe(error);
    expect(result.message).toBe("Erro de negócio");
  });

  it("deve converter string em Error", () => {
    const result = handleApiError("algum erro string");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("algum erro string");
  });

  it("deve retornar erro genérico para null", () => {
    const result = handleApiError(null);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Erro desconhecido na API");
  });

  it("deve retornar erro genérico para undefined", () => {
    const result = handleApiError(undefined);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Erro desconhecido na API");
  });

  it("deve retornar erro genérico para número", () => {
    const result = handleApiError(42);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Erro desconhecido na API");
  });

  it("deve retornar erro genérico para objeto", () => {
    const result = handleApiError({ code: 500 });
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Erro desconhecido na API");
  });

  it("deve preservar status de Error que já possui status", () => {
    const error = new Error("Not Found") as Error & { status: number };
    error.status = 404;
    const result = handleApiError(error);
    expect(result.status).toBe(404);
  });
});
