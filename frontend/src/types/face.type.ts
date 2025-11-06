export interface VerificarRostoResponse {
  existe: boolean;
  bloqueado?: boolean;  
  dados: {
    usuario: {
      id: string;  
      nome: string;
      tipoUsuario: string;
      dataCadastro: string;
      status?: string; 
      bloqueadoAte?: string;  
    };
    similaridade: number;
    distancia: number;
  } | null;
}