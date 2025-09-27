/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from 'react';
import type { VerificarRostoResponse } from '../../types/face.type';
import { baseURL } from '../../config/url';
import { useAuth } from '../auth/useAuth';

interface ApiError extends Error {
  status?: number;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    authenticatedFetch,
  } = useAuth();

  const handleApiError = useCallback((error: any): ApiError => {
    console.error('Erro na API:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const apiError = new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.') as ApiError;
      apiError.status = 0;
      return apiError;
    }
    
    if (error instanceof Error) {
      return error as ApiError;
    }
    
    const apiError = new Error(typeof error === 'string' ? error : 'Erro desconhecido na API') as ApiError;
    return apiError;
  }, []);


  const verificarRosto = useCallback(async (descriptor: number[], contexto: string): Promise<VerificarRostoResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Verificando rosto, tamanho do descritor:', descriptor?.length);
      
      const response = await authenticatedFetch(`${baseURL}/verificar-rosto`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ descriptor, contexto })
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Erro ao parsear resposta:', parseError, 'Resposta:', responseText);
        throw new Error(`Resposta inválida do servidor: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Erro HTTP: ${response.status}`);
      }

      const result = {
        existe: data.encontrado || false,
        dados: data.encontrado ? {
          usuario: data.usuario,
          similaridade: data.similaridade || 0,
          distancia: data.distancia || 0
        } : null
      };
      
      console.log('Resultado da verificação:', result);
      return result;
      
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      console.error('Erro na verificação:', apiError);
      throw apiError;

    } finally {
      setLoading(false);
    }
  }, [baseURL, handleApiError]);
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    setLoading,
    error,
    setError,
    verificarRosto,
    clearError,
    handleApiError,
  };
};