import { useState, useCallback } from "react";

import { handleApiError as handleApiErrorUtil, type ApiError } from "../../utils/errorHandling";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = useCallback((error: unknown): ApiError => {
    console.error("Erro na API:", error);
    return handleApiErrorUtil(error);
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
