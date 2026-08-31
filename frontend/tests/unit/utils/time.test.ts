import { describe, it, expect } from "vitest";
import { formatarTempo, calcularTempoRestante } from "../../../src/utils/time";

describe("formatarTempo", () => {
  it("deve retornar 'alguns segundos' para 0ms", () => {
    expect(formatarTempo(0)).toBe("alguns segundos");
  });

  it("deve retornar 'alguns segundos' para valor negativo", () => {
    expect(formatarTempo(-5000)).toBe("alguns segundos");
  });

  it("deve formatar apenas segundos", () => {
    expect(formatarTempo(30000)).toBe("30 segundos");
  });

  it("deve usar singular para 1 segundo", () => {
    expect(formatarTempo(1000)).toBe("1 segundo");
  });

  it("deve formatar minutos e segundos", () => {
    expect(formatarTempo(90000)).toBe("1 minuto e 30 segundos");
  });

  it("deve usar plural para múltiplos minutos", () => {
    expect(formatarTempo(120000)).toBe("2 minutos e 0 segundo");
  });

  it("deve formatar 1 minuto exato", () => {
    expect(formatarTempo(60000)).toBe("1 minuto e 0 segundo");
  });

  it("deve formatar combinação de minutos e segundos", () => {
    expect(formatarTempo(150000)).toBe("2 minutos e 30 segundos");
  });
});

describe("calcularTempoRestante", () => {
  it("deve retornar tempo positivo para bloqueadoAte no futuro", () => {
    const futuro = new Date(Date.now() + 30000).toISOString();
    const resultado = calcularTempoRestante(futuro);
    expect(resultado).toBeGreaterThan(0);
    expect(resultado).toBeLessThanOrEqual(30000);
  });

  it("deve retornar 0 para bloqueadoAte no passado", () => {
    const passado = new Date(Date.now() - 30000).toISOString();
    expect(calcularTempoRestante(passado)).toBe(0);
  });

  it("deve retornar 0 para bloqueadoAte exatamente agora", () => {
    const agora = new Date().toISOString();
    expect(calcularTempoRestante(agora)).toBe(0);
  });

  it("deve calcular corretamente com parâmetro agora customizado", () => {
    const agora = Date.now();
    const bloqueadoAte = new Date(agora + 60000).toISOString();
    const resultado = calcularTempoRestante(bloqueadoAte, agora);
    expect(resultado).toBe(60000);
  });
});
