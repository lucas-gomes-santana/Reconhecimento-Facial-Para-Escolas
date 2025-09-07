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
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  
  // Funções
  handleIniciarReconhecimento: () => Promise<void>;
  handlePararReconhecimento: () => void;
  handleSalvarCadastro: (e: React.FormEvent) => Promise<void>;
}