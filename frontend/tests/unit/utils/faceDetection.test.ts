import { describe, it, expect } from "vitest";
import { calculateDistance, analyzeExpression } from "../../../src/utils/faceDetection";
import type { DistanceConfig } from "../../../src/types/distance.types";

const defaultConfig: DistanceConfig = {
  minFaceSize: 150,
  maxFaceSize: 350,
  idealMinSize: 180,
  idealMaxSize: 280,
};

describe("calculateDistance", () => {
  it("deve retornar muito_longe quando face é muito pequena", () => {
    const result = calculateDistance(100, 100, defaultConfig);
    expect(result.status).toBe("muito_longe");
    expect(result.isIdeal).toBe(false);
  });

  it("deve retornar longe quando face está entre minFace e idealMin", () => {
    const result = calculateDistance(160, 160, defaultConfig);
    expect(result.status).toBe("longe");
    expect(result.isIdeal).toBe(false);
  });

  it("deve retornar ideal quando face está na faixa ideal", () => {
    const result = calculateDistance(230, 230, defaultConfig);
    expect(result.status).toBe("ideal");
    expect(result.isIdeal).toBe(true);
  });

  it("deve retornar perto quando face está entre idealMax e maxFace", () => {
    const result = calculateDistance(310, 310, defaultConfig);
    expect(result.status).toBe("perto");
    expect(result.isIdeal).toBe(false);
  });

  it("deve retornar muito_perto quando face é muito grande", () => {
    const result = calculateDistance(400, 400, defaultConfig);
    expect(result.status).toBe("muito_perto");
    expect(result.isIdeal).toBe(false);
  });

  it("deve calcular faceSize corretamente com face retangular", () => {
    const result = calculateDistance(200, 300, defaultConfig);
    expect(result.faceSize).toBe(Math.round(Math.sqrt(200 * 300)));
  });

  it("deve retornar faceSize arredondado", () => {
    const result = calculateDistance(201, 201, defaultConfig);
    expect(Number.isInteger(result.faceSize)).toBe(true);
  });
});

describe("analyzeExpression", () => {
  const neutralExpressions = {
    neutral: 0.85,
    happy: 0.05,
    sad: 0.03,
    angry: 0.02,
    fearful: 0.01,
    disgusted: 0.02,
    surprised: 0.02,
  };

  it("deve detectar expressão neutra com confiança alta", () => {
    const result = analyzeExpression(neutralExpressions);
    expect(result.expression).toBe("neutra");
    expect(result.isNeutral).toBe(true);
    expect(result.confidence).toBe(85);
  });

  it("deve detectar expressão feliz como dominante", () => {
    const expressions = {
      neutral: 0.1,
      happy: 0.9,
      sad: 0.0,
      angry: 0.0,
      fearful: 0.0,
      disgusted: 0.0,
      surprised: 0.0,
    };
    const result = analyzeExpression(expressions);
    expect(result.expression).toBe("feliz");
    expect(result.isNeutral).toBe(false);
    expect(result.confidence).toBe(90);
  });

  it("deve marcar isNeutral como false quando neutral tem confiança abaixo de 0.6", () => {
    const expressions = {
      neutral: 0.5,
      happy: 0.3,
      sad: 0.2,
    };
    const result = analyzeExpression(expressions);
    expect(result.isNeutral).toBe(false);
  });

  it("deve marcar isNeutral como true quando neutral tem confiança exatamente 0.6", () => {
    const expressions = {
      neutral: 0.6,
      happy: 0.2,
      sad: 0.2,
    };
    const result = analyzeExpression(expressions);
    expect(result.isNeutral).toBe(true);
    expect(result.confidence).toBe(60);
  });

  it("deve traduzir expressão triste", () => {
    const expressions = {
      neutral: 0.05,
      happy: 0.05,
      sad: 0.9,
      angry: 0.0,
      fearful: 0.0,
      disgusted: 0.0,
      surprised: 0.0,
    };
    const result = analyzeExpression(expressions);
    expect(result.expression).toBe("triste");
  });

  it("deve manter nome original para expressão desconhecida", () => {
    const expressions = {
      neutral: 0.0,
      custom_expression: 0.99,
    };
    const result = analyzeExpression(expressions);
    expect(result.expression).toBe("custom_expression");
  });

  it("deve arredondar confiança para inteiro", () => {
    const expressions = {
      neutral: 0.777,
    };
    const result = analyzeExpression(expressions);
    expect(result.confidence).toBe(78);
  });
});
