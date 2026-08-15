import { describe, it, expect, vi, beforeEach } from "vitest";

import { FaceRecognitionService } from "../../../services/faceRecognitionService.ts";
import {
  descriptorValido,
  descriptorSimilar,
  descriptorDiferente,
  descriptorZeros,
  descriptorValoresAltos,
} from "../../fixtures/descriptors.ts";

describe("FaceRecognitionService", () => {
  let service: FaceRecognitionService;

  beforeEach(() => {
    service = new FaceRecognitionService();
    vi.clearAllMocks();
  });

  describe("calcularSimilaridadeCossenos", () => {
    it("deve retornar 1 para descritores exatamente iguais", () => {
      const similaridade = service.calcularSimilaridadeCossenos(descriptorValido, descriptorValido);
      expect(similaridade).toBeCloseTo(1, 5);
    });

    it("deve retornar próximo de 1 para descritores muito similares (mesma pessoa)", () => {
      const similaridade = service.calcularSimilaridadeCossenos(
        descriptorValido,
        descriptorSimilar,
      );
      expect(similaridade).toBeGreaterThan(0.95);
      expect(similaridade).toBeLessThanOrEqual(1);
    });

    it("deve retornar valor baixo para descritores diferentes (pessoas diferentes)", () => {
      const similaridade = service.calcularSimilaridadeCossenos(
        descriptorValido,
        descriptorDiferente,
      );
      expect(similaridade).toBeLessThan(0.9);
    });

    it("deve retornar 0 para arrays de tamanhos diferentes", () => {
      const resultado = service.calcularSimilaridadeCossenos([1, 2, 3], [1, 2, 3, 4]);
      expect(resultado).toBe(0);
    });

    it("deve retornar 0 para arrays vazios", () => {
      const resultado = service.calcularSimilaridadeCossenos([], []);
      expect(resultado).toBe(0);
    });

    it("deve retornar 0 quando um array tem magnitude zero (todos zeros)", () => {
      const resultado = service.calcularSimilaridadeCossenos(descriptorZeros, descriptorValido);
      expect(resultado).toBe(0);
    });

    it("deve retornar 0 quando ambos os arrays têm magnitude zero", () => {
      const resultado = service.calcularSimilaridadeCossenos(descriptorZeros, descriptorZeros);
      expect(resultado).toBe(0);
    });

    it("deve funcionar com valores altos (evitar overflow)", () => {
      const similaridade = service.calcularSimilaridadeCossenos(
        descriptorValoresAltos,
        descriptorValoresAltos,
      );
      expect(similaridade).toBeCloseTo(1, 5);
    });

    it("deve retornar similaridade simétrica", () => {
      const sim1 = service.calcularSimilaridadeCossenos(descriptorValido, descriptorDiferente);
      const sim2 = service.calcularSimilaridadeCossenos(descriptorDiferente, descriptorValido);
      expect(Math.abs(sim1 - sim2)).toBeLessThan(0.0001);
    });

    it("deve retornar -1 quando vetores são opostos ( mesmo tamanho mas direção oposta)", () => {
      const vetor1 = [1, 0, 0];
      const vetor2 = [-1, 0, 0];
      const similaridade = service.calcularSimilaridadeCossenos(vetor1, vetor2);
      expect(similaridade).toBe(-1);
    });

    it("deve retornar 0 para vetores ortogonais", () => {
      const vetor1 = [1, 0, 0];
      const vetor2 = [0, 1, 0];
      const similaridade = service.calcularSimilaridadeCossenos(vetor1, vetor2);
      expect(similaridade).toBe(0);
    });

    it("deve calcular corretamente para 2D", () => {
      const vetorA = [3, 4];
      const vetorB = [3, 4];
      const similaridade = service.calcularSimilaridadeCossenos(vetorA, vetorB);
      expect(similaridade).toBe(1);
    });

    it("deve retornar similaridade correta para caso conhecido", () => {
      const vetorA = [1, 0, 0];
      const vetorB = [1, 0, 0];
      const similaridade = service.calcularSimilaridadeCossenos(vetorA, vetorB);
      expect(similaridade).toBe(1);
    });

    it("deve lançar erro se descriptor1 for null", () => {
      expect(() =>
        service.calcularSimilaridadeCossenos(null as unknown as number[], [1, 2]),
      ).toThrow();
    });

    it("deve lançar erro se descriptor2 for null", () => {
      expect(() =>
        service.calcularSimilaridadeCossenos([1, 2], null as unknown as number[]),
      ).toThrow();
    });

    it("deve retornar 0 se descritor não for array", () => {
      const resultado = service.calcularSimilaridadeCossenos(
        "não é array" as unknown as number[],
        [1, 2],
      );
      expect(resultado).toBe(0);
    });

    it("deve calcular com precisão para 3D", () => {
      const v1 = [1, 2, 3];
      const v2 = [1, 2, 3];
      const similaridade = service.calcularSimilaridadeCossenos(v1, v2);
      expect(similaridade).toBe(1);
    });
  });

  describe("threshold padrão", () => {
    it("deve ter threshold padrão de 0.96", () => {
      expect((service as unknown as { threshold: number }).threshold).toBe(0.96);
    });
  });
});
