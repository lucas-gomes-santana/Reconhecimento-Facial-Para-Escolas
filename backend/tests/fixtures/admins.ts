import type { IAdmin } from "../../models/Admin.ts";

type AdminMock = Pick<
  IAdmin,
  "nome" | "senha" | "funcao" | "ativo" | "ultimoLogin" | "createdAt" | "updatedAt" | "dataCadastro"
> & { _id: string };

export const adminMock: AdminMock = {
  _id: "507f1f77bcf86cd799439011",
  nome: "admin",
  senha: "$2b$12$hashedpassword",
  funcao: "admin",
  ativo: true,
  ultimoLogin: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  dataCadastro: new Date("2025-01-01"),
};

export const superAdminMock: AdminMock = {
  _id: "507f1f77bcf86cd799439012",
  nome: "superadmin",
  senha: "$2b$12$hashedpassword",
  funcao: "super-admin",
  ativo: true,
  ultimoLogin: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  dataCadastro: new Date("2025-01-01"),
};

export const desenvolvedorMock: AdminMock = {
  _id: "507f1f77bcf86cd799439013",
  nome: "desenvolvedor",
  senha: "$2b$12$hashedpassword",
  funcao: "desenvolvedor",
  ativo: true,
  ultimoLogin: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  dataCadastro: new Date("2025-01-01"),
};

export const adminInput: { nome: string; senha: string; funcao: string } = {
  nome: "novoadmin",
  senha: "senha123",
  funcao: "admin",
};

export const novoAdminCriado: { _id: string; nome: string; funcao: string } = {
  _id: "507f1f77bcf86cd799439099",
  nome: "novoadmin",
  funcao: "admin",
};
