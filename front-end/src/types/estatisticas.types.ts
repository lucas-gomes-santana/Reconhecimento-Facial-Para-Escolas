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