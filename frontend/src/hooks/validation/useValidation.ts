import { useCallback, useState } from "react";

import type { DistanceStatus, DistanceValidationResult } from "../../types/distance.types";
import type { ValidationResult } from "../../types/validation.types";

export const useValidation = () => {
  const [, setStatusMessage] = useState("");

  const validateCadastroForm = useCallback(
    (nome: string, tipoUsuario: string): ValidationResult => {
      const errors: string[] = [];

      if (!nome || !nome.trim()) {
        errors.push("Nome é obrigatório");
      }

      if (nome && nome.trim().length < 2) {
        errors.push("Nome deve ter pelo menos 2 caracteres");
      }

      if (!tipoUsuario) {
        errors.push("Tipo de usuário é obrigatório");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [],
  );

  const validateDescriptor = useCallback(
    (descriptor: number[] | null, isAtCorrectDistance: boolean = true): ValidationResult => {
      const errors: string[] = [];

      if (!isAtCorrectDistance) {
        errors.push("Posicione-se na distância ideal da câmera (30cm a 60cm)");
      }

      if (!descriptor || descriptor.length === 0) {
        errors.push(
          "Descritor facial não foi capturado. Certifique-se de que seu rosto está visível e bem iluminado.",
        );
      }

      if (!Array.isArray(descriptor)) {
        errors.push("Descritor facial inválido");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [],
  );

  const validateExpression = useCallback(
    (expressionStatus: {
      expression: string;
      isNeutral: boolean;
      confidence: number;
    }): ValidationResult => {
      const errors: string[] = [];

      if (!expressionStatus.isNeutral) {
        errors.push(
          `Mantenha uma expressão facial neutra. Expressão facial capturada: ${expressionStatus.expression}`,
        );
      }

      if (expressionStatus.confidence < 60) {
        errors.push(
          "Confiança da detecção de expressão muito baixa. Certifique-se de estar bem iluminado e posicionado.",
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [],
  );

  const validateDistance = useCallback(
    (distanceStatus: DistanceStatus): DistanceValidationResult => {
      const errors: string[] = [];
      let isIdeal = false;

      switch (distanceStatus) {
        case "muito_longe":
          errors.push("Muito longe da câmera. Aproxime-se mais.");
          break;
        case "longe":
          errors.push("Um pouco longe da câmera. Aproxime-se mais um pouco.");
          break;
        case "perto":
          errors.push("Um pouco perto da câmera. Afaste-se levemente.");
          break;
        case "muito_perto":
          errors.push("Muito perto da câmera. Afaste-se mais.");
          break;
        case "sem_face":
          errors.push(
            "Nenhum rosto foi detectado. Certifique-se de estar bem posicionado e com boa iluminação.",
          );
          break;
        case "ideal":
          isIdeal = true;
          break;
      }

      return {
        isValid: errors.length === 0,
        errors,
        isIdeal,
      };
    },
    [],
  );

  const getDistanceMessage = useCallback(
    (
      distanceStatus: DistanceStatus,
      expressionStatus?: { expression: string; isNeutral: boolean; confidence: number },
    ): string => {
      const distanceMessages = {
        muito_longe: "Muito longe - Aproxime-se da câmera",
        longe: "Longe - Aproxime-se um pouco mais",
        ideal: "Perfeito! Mantenha essa posição",
        perto: "Perto - Afaste-se um pouco",
        muito_perto: "Muito perto! Afaste-se mais",
        sem_face: "Nenhum rosto detectado - Posicione-se frente à câmera",
      };

      let message = distanceMessages[distanceStatus] || "Ajuste sua posição";

      if (expressionStatus && distanceStatus !== "sem_face") {
        if (!expressionStatus.isNeutral) {
          message += ` | Expressão: ${expressionStatus.expression} - Mantenha neutra!`;
        } else {
          message += " | Expressão: Neutra";
        }
      }

      return message;
    },
    [],
  );

  const showValidationErrors = useCallback((errors: string[] | string) => {
    const message = Array.isArray(errors) ? errors.join(" - ") : String(errors);
    setStatusMessage(message);
  }, []);

  return {
    validateCadastroForm,
    validateDescriptor,
    validateDistance,
    getDistanceMessage,
    validateExpression,
    showValidationErrors,
  };
};
