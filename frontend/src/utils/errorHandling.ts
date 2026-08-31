export interface ApiError extends Error {
  status?: number;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const apiError = new Error(
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta correta.",
      ) as ApiError;
      apiError.status = 0;
      return apiError;
    }

    return error as ApiError;
  }

  const apiError = new Error(
    typeof error === "string" ? error : "Erro desconhecido na API",
  ) as ApiError;
  return apiError;
};
