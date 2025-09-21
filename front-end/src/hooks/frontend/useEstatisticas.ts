import { useState, useCallback, useEffect } from 'react';
import type { EstatisticasBasicas } from '../../types/estatisticas.types';
import { baseURL } from '../../config/url';


export const useEstatisticas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasBasicas | null>(null);
  const [mostrandoDetalhes, setMostrandoDetalhes] = useState(false);

  const carregarEstatisticas = useCallback(async (detalhadas: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = detalhadas ? '/estatisticas/detalhadas' : '/estatisticas';
      
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      setEstatisticas(data.dados || data);
      setMostrandoDetalhes(detalhadas);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      throw err;
      
    } finally {
      setLoading(false);
    }
  }, []);

  const resetarEstatisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {      
      const response = await fetch(`${baseURL}/estatisticas/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      // Recarrega as estatísticas após resetar
      await carregarEstatisticas(mostrandoDetalhes);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resetar estatísticas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carregarEstatisticas, mostrandoDetalhes]);

  const toggleDetalhes = useCallback(async () => {
    const novoEstado = !mostrandoDetalhes;
    await carregarEstatisticas(novoEstado);
  }, [mostrandoDetalhes, carregarEstatisticas]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const formatarData = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString || 'Data não disponível';
    }
  }, []);

  // Escutar por remoções de usuários para atualizar estatísticas
  useEffect(() => {
    const handleUserDeleted = () => {
      if (estatisticas) {
        carregarEstatisticas(mostrandoDetalhes);
      }
    };

    window.addEventListener('userDeleted', handleUserDeleted);
    return () => window.removeEventListener('userDeleted', handleUserDeleted);
  }, [estatisticas, mostrandoDetalhes, carregarEstatisticas]);

  return {
    loading,
    error,
    estatisticas,
    mostrandoDetalhes,
    carregarEstatisticas,
    resetarEstatisticas,
    toggleDetalhes,
    clearError,
    formatarData
  };
};