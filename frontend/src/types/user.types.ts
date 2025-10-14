export interface UsuarioData {
  nome: string;
  tipoUsuario: string;
  descriptor: number[];
}

export interface Usuario {
  _id: string;
  nome: string;
  tipoUsuario: string;
  dataCadastro: string;
} 

export interface UsuarioPorTipo { 
  _id: string;
  quantidade: number;
}

export interface UsuariosOrganizados {
  tipo: string;
  usuarios: string[];
  quantidade: number;
}