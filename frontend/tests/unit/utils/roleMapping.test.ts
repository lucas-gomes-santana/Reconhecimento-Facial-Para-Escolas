import { describe, it, expect } from "vitest";
import { formatarFuncao, getTipoAdminColor, getTipoUsuarioColor } from "../../../src/utils/roleMapping";

describe("formatarFuncao", () => {
  it("deve formatar admin para Administrador", () => {
    expect(formatarFuncao("admin")).toBe("Administrador");
  });

  it("deve formatar seguranca para Segurança", () => {
    expect(formatarFuncao("seguranca")).toBe("Segurança");
  });

  it("deve formatar segurança para Segurança", () => {
    expect(formatarFuncao("segurança")).toBe("Segurança");
  });

  it("deve formatar super-admin para Super Admin", () => {
    expect(formatarFuncao("super-admin")).toBe("Super Admin");
  });

  it("deve formatar desenvolvedor para Desenvolvedor", () => {
    expect(formatarFuncao("desenvolvedor")).toBe("Desenvolvedor");
  });

  it("deve retornar o valor original para função desconhecida", () => {
    expect(formatarFuncao("outra")).toBe("outra");
  });

  it("deve ser case-insensitive", () => {
    expect(formatarFuncao("ADMIN")).toBe("Administrador");
    expect(formatarFuncao("Super-Admin")).toBe("Super Admin");
  });
});

describe("getTipoAdminColor", () => {
  it("deve retornar cor roxa para admin", () => {
    const color = getTipoAdminColor("admin");
    expect(color).toContain("purple");
  });

  it("deve retornar cor vermelha para seguranca", () => {
    const color = getTipoAdminColor("seguranca");
    expect(color).toContain("red");
  });

  it("deve retornar cor verde para super-admin", () => {
    const color = getTipoAdminColor("super-admin");
    expect(color).toContain("green");
  });

  it("deve retornar cor amarela para desenvolvedor", () => {
    const color = getTipoAdminColor("desenvolvedor");
    expect(color).toContain("yellow");
  });

  it("deve retornar cor cinza para tipo desconhecido", () => {
    const color = getTipoAdminColor("desconhecido");
    expect(color).toContain("gray");
  });

  it("deve ser case-insensitive", () => {
    expect(getTipoAdminColor("ADMIN")).toContain("purple");
  });
});

describe("getTipoUsuarioColor", () => {
  it("deve retornar cor azul para professor", () => {
    const color = getTipoUsuarioColor("professor");
    expect(color).toContain("blue");
  });

  it("deve retornar cor verde para aluno", () => {
    const color = getTipoUsuarioColor("aluno");
    expect(color).toContain("green");
  });

  it("deve retornar cor amarela para funcionário", () => {
    const color = getTipoUsuarioColor("funcionário");
    expect(color).toContain("yellow");
  });

  it("deve retornar cor amarela para funcionario (sem acento)", () => {
    const color = getTipoUsuarioColor("funcionario");
    expect(color).toContain("yellow");
  });

  it("deve retornar cor cinza para tipo desconhecido", () => {
    const color = getTipoUsuarioColor("outro");
    expect(color).toContain("gray");
  });

  it("deve ser case-insensitive", () => {
    expect(getTipoUsuarioColor("PROFESSOR")).toContain("blue");
    expect(getTipoUsuarioColor("ALUNO")).toContain("green");
  });
});
