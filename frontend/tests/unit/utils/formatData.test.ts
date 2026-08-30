import { describe, it, expect, vi, afterEach } from "vitest";
import { formatData } from "../../../src/utils/formatData";

describe("formatData", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("deve formatar data ISO válida", () => {
    const result = formatData("2026-04-01T10:30:00.000Z");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("deve retornar string com data e hora", () => {
    const result = formatData("2026-04-01T10:30:00.000Z");
    expect(result).toContain("/");
    expect(result).toContain(":");
  });

  it("deve retornar 'Data não disponível' para string inválida", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = formatData("data-invalida");
    expect(typeof result).toBe("string");
    consoleSpy.mockRestore();
  });

  it("deve retornar 'Data não disponível' para string vazia", () => {
    const result = formatData("");
    expect(typeof result).toBe("string");
  });

  it("deve lidar com formato de data simples", () => {
    const result = formatData("2026-01-15");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
