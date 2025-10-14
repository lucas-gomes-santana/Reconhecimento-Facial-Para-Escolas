import type { UsuarioPorTipo, UsuariosOrganizados } from "./user.types";

export interface EstatisticasBasicas {
  totalCadastros: number;
  totalVerificacoes: number;
  ultimaAtualizacao: string;
}

export interface EstatisticasDetalhadas extends EstatisticasBasicas {
  usuariosPorTipo: Array<{
    _id: string;
    quantidade: number;
  }>;
  primeiroCadastro?: string;
}

export interface DadosEstatisticas {
  totalCadastros: number;
  totalVerificacoes: number;
  usuariosPorTipo?: UsuarioPorTipo[];
  usuariosOrganizados?: UsuariosOrganizados[]; // ← ADICIONAR ESTA LINHA
  primeiroCadastro?: string;
  ultimoCadastro?: string;
  ultimaAtualizacao: string;
}