export interface VerificarRostoResponse {
  existe: boolean;
  dados?: {
    usuario: unknown;
    similaridade: number;
    distancia: number;
  } | null;
}