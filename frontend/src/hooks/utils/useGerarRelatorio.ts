import { useState } from "react";

import { useAuth } from "../auth/useAuth";
import { baseURL } from "../../config/url";
import { gerarRelatorioPdf } from "../../templates/generatePdf";

export const useGerarRelatorio = () => {
  const { authenticatedFetch } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gerarRelatorio = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(`${baseURL}/estatisticas/relatorio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao gerar relatório");
      }

      gerarRelatorioPdf(result.dados);

      return { success: true };
    } catch (error) {
      console.error("Erro desconhecido ao gerar o relatório: ", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido ao gerar relatório";

      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    gerarRelatorio,
    loading,
    error,
    clearError,
  };
};
