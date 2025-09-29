import { useCallback } from 'react';
import type { DistanceStatus, DistanceValidationResult } from '../../types/distance.types';
import type { ValidationResult } from '../../types/validation.types';


export const useValidation = () => {
  
  const validateCadastroForm = useCallback((nome: string, tipoUsuario: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!nome || !nome.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if (nome && nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!tipoUsuario) {
      errors.push('Tipo de usuário é obrigatório');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateDescriptor = useCallback((descriptor: number[] | null, isAtCorrectDistance: boolean = true): ValidationResult => {
    const errors: string[] = [];
    
    if (!isAtCorrectDistance) {
      errors.push('Posicione-se na distância ideal da câmera (30cm a 60cm)');
    }
    
    if (!descriptor || descriptor.length === 0) {
      errors.push('Descritor facial não foi capturado. Certifique-se de que seu rosto está visível e bem iluminado.');
    }
    
    if (!Array.isArray(descriptor)) {
      errors.push('Descritor facial inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateDistance = useCallback((distanceStatus: DistanceStatus): DistanceValidationResult => {
    const errors: string[] = [];
    let isIdeal = false;
    
    switch(distanceStatus) {
      case 'muito_longe':
        errors.push('Muito longe da câmera. Aproxime-se mais.');
        break;
      case 'longe':
        errors.push('Um pouco longe da câmera. Aproxime-se mais um pouco.');
        break;
      case 'perto':
        errors.push('Um pouco perto da câmera. Afaste-se levemente.');
        break;
      case 'muito_perto':
        errors.push('Muito perto da câmera. Afaste-se mais.');
        break;
      case 'sem_face':
        errors.push('Nenhum rosto foi detectado. Certifique-se de estar bem posicionado e com boa iluminação.');
        break;
      case 'ideal':
        isIdeal = true;
        // Distância ideal, sem erros
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      isIdeal
    };
  }, []);

  const getDistanceMessage = useCallback((distanceStatus: DistanceStatus): string => {
    const messages = {
      'muito_longe': 'Muito longe - Aproxime-se da câmera',
      'longe': 'Longe - Aproxime-se um pouco mais',
      'ideal': 'Perfeito! Mantenha essa posição',
      'perto': 'Perto - Afaste-se um pouco',
      'muito_perto': 'Muito perto! Afaste-se mais',
      'sem_face': 'Nenhum rosto detectado - Posicione-se frente à câmera'
    };
    
    return messages[distanceStatus] || 'Ajuste sua posição';
  }, []);

  const showValidationErrors = useCallback((errors: string[]): string => {
    if (errors.length > 0) {
      const errorMessage = errors.join('\n');
      alert(errorMessage);
      return errorMessage;
    }
    return '';
  }, []);

  return {
    validateCadastroForm,
    validateDescriptor,
    validateDistance,
    getDistanceMessage,
    showValidationErrors
  };
};