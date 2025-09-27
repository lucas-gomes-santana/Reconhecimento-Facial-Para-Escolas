export interface UseCadastroFacialReturn {
  // Estados
  nome: string;
  tipoUsuario: string;
  statusMessage: string;
  canSave: boolean;
  isLoading: boolean;
  isDetecting: boolean;
  videoReady: boolean;
  
  // Setters
  setNome: (nome: string) => void;
  setTipoUsuario: (tipo: string) => void;
  
  // Refs
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  
  // Funções
  handleIniciarReconhecimento: () => Promise<void>;
  handlePararReconhecimento: () => void;
  handleSalvarCadastro: (e: React.FormEvent) => Promise<void>;
}