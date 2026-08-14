import { useCallback } from "react";

export const useFormatData = () => {
  const formatData = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data não disponível";
    }
  }, []);

  return {
    formatData,
  };
};
