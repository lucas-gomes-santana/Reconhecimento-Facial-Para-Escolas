import { describe, it, expect } from "vitest";
import {
  validateCadastroForm,
  validateDescriptor,
  validateExpression,
  validateDistance,
  getDistanceMessage,
} from "../../../src/utils/validation";

describe("validateCadastroForm", () => {
  it("deve retornar válido para dados corretos", () => {
    const result = validateCadastroForm("João Silva", "Aluno");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("deve retornar erro quando nome está vazio", () => {
    const result = validateCadastroForm("", "Aluno");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Nome é obrigatório");
  });

  it("deve retornar erro quando nome é só espaços", () => {
    const result = validateCadastroForm("   ", "Aluno");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Nome é obrigatório");
  });

  it("deve retornar erro quando nome tem menos de 2 caracteres", () => {
    const result = validateCadastroForm("A", "Aluno");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Nome deve ter pelo menos 2 caracteres");
  });

  it("deve aceitar nome com exatamente 2 caracteres", () => {
    const result = validateCadastroForm("Jo", "Aluno");
    expect(result.isValid).toBe(true);
  });

  it("deve retornar erro quando tipo de usuário está vazio", () => {
    const result = validateCadastroForm("João Silva", "");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Tipo de usuário é obrigatório");
  });

  it("deve retornar múltiplos erros quando todos os campos estão inválidos", () => {
    const result = validateCadastroForm("", "");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("validateDescriptor", () => {
  const validDescriptor = new Array(128).fill(0.5);

  it("deve retornar válido para descriptor válido", () => {
    const result = validateDescriptor(validDescriptor, true);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("deve retornar erro quando descriptor é null", () => {
    const result = validateDescriptor(null, true);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("deve retornar erro quando descriptor está vazio", () => {
    const result = validateDescriptor([], true);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("deve retornar erro quando não está na distância correta", () => {
    const result = validateDescriptor(validDescriptor, false);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Posicione-se na distância ideal da câmera (30cm a 60cm)",
    );
  });

  it("deve retornar ambos os erros quando descriptor é null e distância incorreta", () => {
    const result = validateDescriptor(null, false);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("validateExpression", () => {
  it("deve retornar válido para expressão neutra com confiança alta", () => {
    const result = validateExpression({
      expression: "neutra",
      isNeutral: true,
      confidence: 85,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("deve retornar erro quando expressão não é neutra", () => {
    const result = validateExpression({
      expression: "feliz",
      isNeutral: false,
      confidence: 80,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("feliz");
  });

  it("deve retornar erro quando confiança é muito baixa", () => {
    const result = validateExpression({
      expression: "neutra",
      isNeutral: true,
      confidence: 30,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("Confiança da detecção");
  });

  it("deve retornar erros quando expressão não neutra e confiança baixa", () => {
    const result = validateExpression({
      expression: "triste",
      isNeutral: false,
      confidence: 20,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(2);
  });

  it("deve aceitar confiança exatamente 60", () => {
    const result = validateExpression({
      expression: "neutra",
      isNeutral: true,
      confidence: 60,
    });
    expect(result.isValid).toBe(true);
  });
});

describe("validateDistance", () => {
  it("deve retornar ideal para distância ideal", () => {
    const result = validateDistance("ideal");
    expect(result.isValid).toBe(true);
    expect(result.isIdeal).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("deve retornar erro para muito_longe", () => {
    const result = validateDistance("muito_longe");
    expect(result.isValid).toBe(false);
    expect(result.isIdeal).toBe(false);
    expect(result.errors[0]).toContain("Muito longe");
  });

  it("deve retornar erro para longe", () => {
    const result = validateDistance("longe");
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("pouco longe");
  });

  it("deve retornar erro para perto", () => {
    const result = validateDistance("perto");
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("pouco perto");
  });

  it("deve retornar erro para muito_perto", () => {
    const result = validateDistance("muito_perto");
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("Muito perto");
  });

  it("deve retornar erro para sem_face", () => {
    const result = validateDistance("sem_face");
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("Nenhum rosto");
  });
});

describe("getDistanceMessage", () => {
  it("deve retornar mensagem correta para cada status", () => {
    expect(getDistanceMessage("muito_longe")).toContain("Muito longe");
    expect(getDistanceMessage("longe")).toContain("Longe");
    expect(getDistanceMessage("ideal")).toContain("Perfeito");
    expect(getDistanceMessage("perto")).toContain("Perto");
    expect(getDistanceMessage("muito_perto")).toContain("Muito perto");
    expect(getDistanceMessage("sem_face")).toContain("Nenhum rosto");
  });

  it("deve adicionar info de expressão quando fornecida e distância não é sem_face", () => {
    const msg = getDistanceMessage("ideal", {
      expression: "neutra",
      isNeutral: true,
      confidence: 80,
    });
    expect(msg).toContain("Expressão: Neutra");
  });

  it("deve adicionar aviso quando expressão não é neutra", () => {
    const msg = getDistanceMessage("ideal", {
      expression: "feliz",
      isNeutral: false,
      confidence: 80,
    });
    expect(msg).toContain("feliz");
    expect(msg).toContain("Mantenha neutra");
  });

  it("não deve adicionar info de expressão quando status é sem_face", () => {
    const msg = getDistanceMessage("sem_face", {
      expression: "neutra",
      isNeutral: true,
      confidence: 80,
    });
    expect(msg).not.toContain("Expressão");
  });
});
