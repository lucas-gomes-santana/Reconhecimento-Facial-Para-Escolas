import { useCallback, useState } from "react";

import type { DistanceStatus, DistanceValidationResult } from "../../types/distance.types";
import type { ValidationResult } from "../../types/validation.types";
import {
  validateCadastroForm as validateCadastroFormUtil,
  validateDescriptor as validateDescriptorUtil,
  validateExpression as validateExpressionUtil,
  validateDistance as validateDistanceUtil,
  getDistanceMessage as getDistanceMessageUtil,
} from "../../utils/validation";

export const useValidation = () => {
  const [, setStatusMessage] = useState("");

  const validateCadastroForm = useCallback(
    (nome: string, tipoUsuario: string): ValidationResult =>
      validateCadastroFormUtil(nome, tipoUsuario),
    [],
  );

  const validateDescriptor = useCallback(
    (descriptor: number[] | null, isAtCorrectDistance: boolean = true): ValidationResult =>
      validateDescriptorUtil(descriptor, isAtCorrectDistance),
    [],
  );

  const validateExpression = useCallback(
    (expressionStatus: {
      expression: string;
      isNeutral: boolean;
      confidence: number;
    }): ValidationResult => validateExpressionUtil(expressionStatus),
    [],
  );

  const validateDistance = useCallback(
    (distanceStatus: DistanceStatus): DistanceValidationResult =>
      validateDistanceUtil(distanceStatus),
    [],
  );

  const getDistanceMessage = useCallback(
    (
      distanceStatus: DistanceStatus,
      expressionStatus?: { expression: string; isNeutral: boolean; confidence: number },
    ): string => getDistanceMessageUtil(distanceStatus, expressionStatus),
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
