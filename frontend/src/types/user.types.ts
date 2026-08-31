export interface UsuarioData {
  nome: string;
  tipoUsuario: string;
  descriptor: number[];
}

export interface Usuario {
  _id: string;
  nome: string;
  tipoUsuario: "Aluno" | "Professor" | "Funcionario" | "Outro";
  dataCadastro: string;
}

export interface UsuarioPorTipo {
  _id: string;
  quantidade: number;
}

export interface UsuariosOrganizados {
  tipo: string;
  usuarios: Usuario[];
  quantidade: number;
}
