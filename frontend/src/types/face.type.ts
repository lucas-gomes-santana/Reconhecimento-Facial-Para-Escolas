export interface VerificarRostoResponse {
  existe: boolean;
  bloqueado?: boolean;  // ✅ ADICIONE
  dados: {
    usuario: {
      id: string;  // ✅ ADICIONE
      nome: string;
      tipoUsuario: string;
      dataCadastro: string;
      status?: string;  // ✅ ADICIONE
      bloqueadoAte?: string;  // ✅ ADICIONE
    };
    similaridade: number;
    distancia: number;
  } | null;
}