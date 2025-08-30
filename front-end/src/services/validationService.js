class ValidationService {
    
    validateCadastroForm(nome, tipoUsuario) {
        const errors = [];
        
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
    }

    validateDescriptor(descriptor, isAtCorrectDistance = true) {
        const errors = [];
        
        if (!isAtCorrectDistance) {
            errors.push('Posicione-se na distância ideal da câmera (30cm a 60cm)');
        }
        
        if (!descriptor) {
            errors.push('Descritor facial não foi capturado');
        }
        
        if (!Array.isArray(descriptor)) {
            errors.push('Descritor facial inválido');
        }
        
        if (Array.isArray(descriptor) && descriptor.length === 0) {
            errors.push('Descritor facial vazio');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateDistance(distanceStatus) {
        const errors = [];
        
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
                errors.push('Nenhum rosto foi detectado. Certifique-se de estar bem posicionado.');
                break;
            case 'ideal':
                // Distância ideal, sem erros
                break;
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            isIdeal: distanceStatus === 'ideal'
        };
    }

    showValidationErrors(errors) {
        const errorMessage = errors.join('\n');
        alert(errorMessage);
        return errorMessage;
    }

    showDistanceMessage(distanceStatus) {
        const messages = {
            'muito_longe': 'Aproxime-se mais da câmera',
            'longe': 'Um pouco mais perto, por favor',
            'ideal': 'Perfeito! Mantenha essa posição',
            'perto': 'Afaste-se um pouco da câmera',
            'muito_perto': 'Muito perto! Afaste-se mais',
            'sem_face': 'Posicione seu rosto na frente da câmera'
        };
        
        return messages[distanceStatus] || 'Ajuste sua posição';
    }
}

// Cria uma instância global
window.ValidationService = new ValidationService();