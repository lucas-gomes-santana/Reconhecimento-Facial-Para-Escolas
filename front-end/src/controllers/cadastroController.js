class CadastroController {
    constructor() {
        this.isDetecting = false;
        this.rostoCaptured = false;
        this.verificacaoAprovada = false;
        this.cadastroData = null;
    }

    async init() {
        try {
            // Aguarda os services serem carregados
            await this.waitForServices();
            await this.setupServices();
            this.setupEventListeners();
            this.setupGlobalFunctions();
            window.UIService.updateStatus('Sistema pronto - Preencha os dados e inicie o reconhecimento');
        } catch (err) {
            console.error('Falha na inicialização:', err);
            this.updateStatusDirect('Erro ao carregar recursos do sistema');
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
        const form = document.getElementById('cadastroForm');
        const iniciarBtn = document.getElementById('iniciarReconhecimento');
        const salvarBtn = document.getElementById('salvarCadastro');

        if (!form || !iniciarBtn || !salvarBtn) {
            throw new Error('Elementos do formulário não encontrados');
        }

        iniciarBtn.addEventListener('click', () => this.handleIniciarReconhecimento());
        salvarBtn.addEventListener('click', () => this.handleSalvarCadastro());
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!salvarBtn.disabled) {
                this.handleSalvarCadastro();
            }
        });

        window.addEventListener('beforeunload', () => {
            if (this.isDetecting && window.FaceDetectionService) {
                window.FaceDetectionService.stopDetection();
            }
        });
    }

    async handleIniciarReconhecimento() {
        const formData = this.getFormData();
        const validation = window.ValidationService.validateCadastroForm(formData.nome, formData.tipoUsuario);
        
        if (!validation.isValid) {
            window.ValidationService.showValidationErrors(validation.errors);
            return;
        }

        try {
            this.setLoadingState(true);
            this.cadastroData = formData;
            
            await this.processarReconhecimento();
            
        } catch (error) {
            console.error('Erro no reconhecimento:', error);
            window.UIService.updateStatus('Erro no reconhecimento - Tente novamente');
            window.UIService.showError(error.message || 'Erro durante o reconhecimento facial');
            this.resetState();
        }
    }

    async processarReconhecimento() {
        window.UIService.updateStatus('Iniciando detecção facial...');
        
        await window.FaceDetectionService.startDetection();
        this.isDetecting = true;

        window.UIService.updateStatus('Posicione seu rosto na frente da câmera...');
        
        const descriptor = await window.FaceDetectionService.aguardarDescriptor(15000, 
            (remaining) => {
                window.UIService.updateStatus(`Detectando rosto... (${remaining}s restantes)`);
            }
        );

        if (!descriptor) {
            throw new Error('Não foi possível capturar seu rosto. Tente novamente.');
        }

        window.FaceDetectionService.stopDetection();
        this.isDetecting = false;
        this.rostoCaptured = true;

        await this.verificarDuplicata(descriptor);
    }

    async verificarDuplicata(descriptor) {
        window.UIService.updateStatus('Rosto capturado! Verificando se já existe no banco de dados...');

        const verificacao = await window.ApiService.verificarRosto(descriptor);
        
        if (verificacao.existe) {
            window.UIService.showRostoExistente(verificacao.dados);
            this.updateButtonState('Rosto Já Cadastrado ❌', true);
        } else {
            window.UIService.showRostoNovo(this.cadastroData.nome, this.cadastroData.tipoUsuario);
            this.updateButtonState('Reconhecimento Concluído ✓', false);
            this.verificacaoAprovada = true;
        }
    }

    async handleSalvarCadastro() {
        if (!this.verificacaoAprovada) {
            alert('Execute o reconhecimento facial primeiro!');
            return;
        }

        try {
            this.setLoadingState(true, 'Salvando cadastro...');

            const descriptor = window.FaceDetectionService.getDescriptor();
            const userData = { ...this.cadastroData, descriptor };

            await window.ApiService.cadastrarUsuario(userData);

            this.resetForm();
            window.UIService.updateStatus('Cadastro realizado com sucesso! Pronto para novo cadastro.');
            window.UIService.showSuccess('Usuário cadastrado com sucesso no sistema!');

        } catch (error) {
            console.error('Erro no cadastro:', error);
            window.UIService.updateStatus('Erro ao salvar - Tente novamente');
            this.handleCadastroError(error);
        }
    }

    handleCadastroError(error) {
        let errorMessage = 'Erro ao salvar cadastro: ';
        
        if (error.message && error.message.includes('409')) {
            errorMessage = 'Este rosto já está cadastrado no sistema!';
        } else if (error.message && error.message.includes('fetch')) {
            errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
        } else {
            errorMessage += (error.message || 'Erro desconhecido');
        }
        
        window.UIService.showError(errorMessage);
        const salvarBtn = document.getElementById('salvarCadastro');
        if (salvarBtn) salvarBtn.disabled = false;
    }

    getFormData() {
        const nomeEl = document.getElementById('nome');
        const tipoEl = document.getElementById('tipoUsuario');
        
        return {
            nome: nomeEl ? nomeEl.value.trim() : '',
            tipoUsuario: tipoEl ? tipoEl.value : ''
        };
    }

    setLoadingState(loading, statusMessage = null) {
        const iniciarBtn = document.getElementById('iniciarReconhecimento');
        const salvarBtn = document.getElementById('salvarCadastro');
        
        if (iniciarBtn) iniciarBtn.disabled = loading;
        if (salvarBtn) salvarBtn.disabled = loading;
        
        if (statusMessage && window.UIService) {
            window.UIService.updateStatus(statusMessage);
        }
    }

    updateButtonState(text, salvarDisabled) {
        const iniciarBtn = document.getElementById('iniciarReconhecimento');
        const salvarBtn = document.getElementById('salvarCadastro');
        
        if (iniciarBtn) iniciarBtn.textContent = text;
        if (salvarBtn) salvarBtn.disabled = salvarDisabled;
    }

    resetState() {
        this.resetButtons();
        if (this.isDetecting && window.FaceDetectionService) {
            window.FaceDetectionService.stopDetection();
            this.isDetecting = false;
        }
    }

    resetButtons() {
        const iniciarBtn = document.getElementById('iniciarReconhecimento');
        const salvarBtn = document.getElementById('salvarCadastro');
        
        if (iniciarBtn) {
            iniciarBtn.disabled = false;
            iniciarBtn.textContent = 'Iniciar Reconhecimento';
        }
        if (salvarBtn) {
            salvarBtn.disabled = true;
        }
        
        this.rostoCaptured = false;
        this.verificacaoAprovada = false;
    }

    resetForm() {
        const form = document.getElementById('cadastroForm');
        if (form) form.reset();
        
        this.resetButtons();
        
        if (window.UIService) {
            window.UIService.clearResults();
        }
    }

    updateStatusDirect(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    setupGlobalFunctions() {
        window.tentarNovamente = () => {
            this.resetButtons();
            if (window.UIService) {
                window.UIService.clearResults();
                window.UIService.updateStatus('Sistema pronto - Preencha os dados e inicie o reconhecimento');
            }
        };

        window.irParaVerificacao = () => {
            if (confirm('Deseja ir para a página de verificação?')) {
                window.location.href = '../pages/comparar.html';
            }
        };
    }
}

// Inicialização automática com verificação de DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        const controller = new CadastroController();
        await controller.init();
    });
} else {
    // DOM já carregado
    (async () => {
        const controller = new CadastroController();
        await controller.init();
    })();
}