import type { DistanceResult } from "./distance.types";

export interface UseCadastroFacialReturn {
  nome: string;
  tipoUsuario: string;
  statusMessage: string;
  canSave: boolean;
  isLoading: boolean;
  isDetecting: boolean;
  videoReady: boolean;

  distanceStatus: DistanceResult,
  isAtIdealDistance: boolean
  
  setNome: (nome: string) => void;
  setTipoUsuario: (tipo: string) => void;
  
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  
  handleIniciarReconhecimento: () => Promise<void>;
  handlePararReconhecimento: () => void;
  handleSalvarCadastro: (e: React.FormEvent) => Promise<void>;
}