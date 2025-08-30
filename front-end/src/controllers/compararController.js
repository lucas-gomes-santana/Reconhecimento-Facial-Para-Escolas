class CompararController {
    constructor() {
        this.isVerifying = false;
    }

    async init() {
        try {
            // Aguarda os services serem carregados
            await this.waitForServices();
            await this.setupServices();
            this.setupEventListeners();
            this.setupGlobalFunctions();
            this.updateUI('Sistema pronto - Clique para verificar seu cadastro', false, 'Iniciar Verificação');
        } catch (err) {
            console.error('Falha na inicialização:', err);
            this.updateStatusDirect('Erro ao carregar recursos do sistema');
            this.showErrorDirect('Não foi possível inicializar o sistema de reconhecimento facial.');
        }
    }

    async waitForServices() {
        // Aguarda até que todos os services estejam disponíveis
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos máximo
        
        while (attempts < maxAttempts) {
            if (window.FaceDetectionService && window.UIService && window.ApiService && window.ValidationService) {
                console.log('Todos os services carregados');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Timeout: Services não foram carregados');
    }

    async setupServices() {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        
        if (!video || !canvas) {
            throw new Error('Elementos de vídeo ou canvas não encontrados');
        }
        
        window.FaceDetectionService.init(video, canvas);
        
        window.UIService.updateStatus('Carregando modelos de IA...');
        await window.FaceDetectionService.loadModels();
    }

    setupEventListeners() {
        const btnVerificar = document.getElementById('iniciarVerificacao');
        if (btnVerificar) {
            btnVerificar.addEventListener('click', () => this.handleVerificacao());
        } else {
            console.warn('Botão iniciarVerificacao não encontrado');
        }

        // Listener para cleanup quando a página for fechada
        window.addEventListener('beforeunload', () => {
            if (this.isVerifying && window.FaceDetectionService) {
                window.FaceDetectionService.stopDetection();
            }
        });
    }

    async handleVerificacao() {
        if (this.isVerifying) return;
        
        try {
            this.isVerifying = true;
            this.setLoadingState();
            
            await this.processarVerificacao();
            
        } catch (error) {
            console.error('Erro na verificação:', error);
            window.UIService.showError(error.message || 'Erro durante a verificação facial');
        } finally {
            this.isVerifying = false;
            this.updateUI('Verificação concluída', false, 'Nova Verificação');
            if (window.FaceDetectionService) {
                window.FaceDetectionService.stopDetection();
            }
        }
    }

    async processarVerificacao() {
        window.UIService.updateStatus('Posicione seu rosto na frente da câmera...');
        window.UIService.clearResults();
        
        await window.FaceDetectionService.startDetection();
        
        const descriptor = await window.FaceDetectionService.aguardarDescriptor(15000, 
            (remaining) => {
                window.UIService.updateStatus(`Detectando rosto... (${remaining}s restantes) - Mantenha-se na frente da câmera`);
            }
        );
        
        if (!descriptor) {
            throw new Error('Não foi possível detectar um rosto claro. Verifique se há iluminação adequada e tente novamente.');
        }

        window.FaceDetectionService.stopDetection();
        window.UIService.updateStatus('Rosto capturado! Buscando no banco de dados...');

        await this.verificarNoServidor(descriptor);
    }

    async verificarNoServidor(descriptor) {
        const validation = window.ValidationService.validateDescriptor(descriptor);
        
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        console.log('Enviando descritor para verificação:', descriptor.length, 'dimensões');
        
        const resultado = await window.ApiService.verificarRosto(descriptor);
        this.exibirResultado(resultado);
    }

    exibirResultado(resultado) {
        if (resultado.existe && resultado.dados) {
            window.UIService.showUsuarioEncontrado(resultado.dados);
        } else {
            window.UIService.showUsuarioNaoEncontrado();
        }
    }

    setLoadingState() {
        this.updateUI('Verificando...', true, 'Verificando...');
        window.UIService.clearResults();
    }

    updateUI(statusText, btnDisabled, btnText) {
        window.UIService.updateStatus(statusText);
        
        const btnVerificar = document.getElementById('iniciarVerificacao');
        if (btnVerificar) {
            btnVerificar.disabled = btnDisabled;
            btnVerificar.textContent = btnText;
        }
    }

    // Métodos auxiliares para casos de emergência
    updateStatusDirect(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.color = 'red';
        }
    }

    showErrorDirect(message) {
        if (window.UIService && typeof window.UIService.showError === 'function') {
            window.UIService.showError(message);
        } else {
            console.error(message);
            this.updateStatusDirect(message);
        }
    }

    setupGlobalFunctions() {
        // Função global para botões de retry
        window.iniciarVerificacao = () => this.handleVerificacao();
        
        // Função global para tentar novamente
        window.tentarNovamente = () => {
            if (window.UIService) {
                window.UIService.clearResults();
                window.UIService.updateStatus('Sistema pronto - Clique para verificar seu cadastro');
            }
            this.updateUI('Sistema pronto - Clique para verificar seu cadastro', false, 'Iniciar Verificação');
        };
        
        // Função global para ir para verificação (se necessário)
        window.irParaVerificacao = () => {
            console.log('Já estamos na página de verificação');
        };
    }
}

// Inicialização automática com verificação de DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('DOM carregado, inicializando CompararController...');
        try {
            const controller = new CompararController();
            await controller.init();
            console.log('CompararController inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar CompararController:', error);
        }
    });
} else {
    // DOM já carregado
    (async () => {
        console.log('DOM já carregado, inicializando CompararController...');
        try {
            const controller = new CompararController();
            await controller.init();
            console.log('CompararController inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar CompararController:', error);
        }
    })();
}