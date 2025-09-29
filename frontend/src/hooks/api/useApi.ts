import { useState, useCallback } from 'react';

interface ApiError extends Error {
  status?: number;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = useCallback((error: any): ApiError => {
    console.error('Erro na API:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const apiError = new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta correta.') as ApiError;
      apiError.status = 0;
      return apiError;
    }
    
    if (error instanceof Error) {
      return error as ApiError;
    }
    
    const apiError = new Error(typeof error === 'string' ? error : 'Erro desconhecido na API') as ApiError;
    return apiError;
  }, []);


  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    setLoading,
    error,
    setError,
    clearError,
    handleApiError,
  };
};