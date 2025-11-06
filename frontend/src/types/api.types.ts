export interface ApiResponse {
    success: boolean;
    message?: string;
    admin?: {
        id: string;
        nome: string;
        funcao: string;
    };
    error?: string;
}
export interface ErrorMessages {
  error: string;
  setError: (error: string) => void;
  clearError: () => void;
  handleBackendError: (error: string) => void;
}