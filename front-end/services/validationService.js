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

    validateDescriptor(descriptor) {
        const errors = [];
        
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

    showValidationErrors(errors) {
        const errorMessage = errors.join('\n');
        alert(errorMessage);
        return errorMessage;
    }
}

// Cria uma instância global
window.ValidationService = new ValidationService();