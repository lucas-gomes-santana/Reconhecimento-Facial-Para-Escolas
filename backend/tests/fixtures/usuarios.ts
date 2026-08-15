import type { IUsuario } from "../../models/Usuario.ts";

type UsuarioMock = Pick<
  IUsuario,
  | "nome"
  | "tipoUsuario"
  | "descriptor"
  | "dataCadastro"
  | "status"
  | "bloqueadoAte"
  | "createdAt"
  | "updatedAt"
> & { _id: string };

export const usuarioMock: UsuarioMock = {
  _id: "607f1f77bcf86cd799439011",
  nome: "João Silva",
  tipoUsuario: "Aluno",
  descriptor: Array(128)
    .fill(0)
    .map(() => Math.random()),
  dataCadastro: new Date("2025-01-01"),
  status: "liberado",
  bloqueadoAte: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const usuarioBloqueadoMock: UsuarioMock = {
  _id: "607f1f77bcf86cd799439012",
  nome: "Maria Santos",
  tipoUsuario: "Professor",
  descriptor: Array(128)
    .fill(0)
    .map(() => Math.random() + 0.1),
  dataCadastro: new Date("2025-01-02"),
  status: "bloqueado",
  bloqueadoAte: new Date(Date.now() + 60000),
  createdAt: new Date("2025-01-02"),
  updatedAt: new Date("2025-01-02"),
};

export const usuarioInput: { nome: string; tipoUsuario: string; descriptor: number[] } = {
  nome: "Novo Usuario",
  tipoUsuario: "Aluno",
  descriptor: Array(128)
    .fill(0)
    .map(() => Math.random()),
};

export const novoUsuarioCriado: {
  _id: string;
  nome: string;
  tipoUsuario: string;
  dataCadastro: Date;
} = {
  _id: "607f1f77bcf86cd799439099",
  nome: "Novo Usuario",
  tipoUsuario: "Aluno",
  dataCadastro: new Date(),
};

export const matchResult: { usuario: UsuarioMock; similaridade: number } = {
  usuario: usuarioMock,
  similaridade: 0.98,
};
