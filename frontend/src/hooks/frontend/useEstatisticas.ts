/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from "react";

import type { EstatisticasBasicas } from "../../types/estatisticas.types";
import { baseURL } from "../../config/url";
import { useApi } from "../api/useApi";
import { useAuth } from "../auth/useAuth";

export const useEstatisticas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasBasicas | null>(null);
  const [mostrandoDetalhes, setMostrandoDetalhes] = useState(false);

  const { handleApiError } = useApi();

  const { authenticatedFetch } = useAuth();

  const carregarEstatisticas = useCallback(async (detalhadas: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = detalhadas ? "/estatisticas/detalhadas" : "/estatisticas";

      const response = await fetch(`${baseURL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      setEstatisticas(data.dados || data);
      setMostrandoDetalhes(detalhadas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar estatísticas";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const obterEstatisticas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/estatisticas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Erro ao parsear resposta:", parseError, "Resposta:", responseText);
        throw new Error(`Resposta inválida do servidor: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      console.error("Erro ao obter estatísticas:", apiError);

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetarEstatisticas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(`${baseURL}/estatisticas/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      await carregarEstatisticas(mostrandoDetalhes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao resetar estatísticas";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carregarEstatisticas, mostrandoDetalhes]);

  const obterEstatisticasDetalhadas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/estatisticas/detalhadas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  const toggleDetalhes = useCallback(async () => {
    const novoEstado = !mostrandoDetalhes;
    await carregarEstatisticas(novoEstado);
  }, [mostrandoDetalhes, carregarEstatisticas]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Escutar por remoções de usuários para atualizar estatísticas
  useEffect(() => {
    const handleUserDeleted = () => {
      if (estatisticas) {
        carregarEstatisticas(mostrandoDetalhes);
      }
    };

    window.addEventListener("userDeleted", handleUserDeleted);
    return () => window.removeEventListener("userDeleted", handleUserDeleted);
  }, [estatisticas, mostrandoDetalhes, carregarEstatisticas]);

  return {
    loading,
    error,
    estatisticas,
    mostrandoDetalhes,
    carregarEstatisticas,
    obterEstatisticas,
    obterEstatisticasDetalhadas,
    resetarEstatisticas,
    toggleDetalhes,
    clearError,
  };
};
