document.addEventListener('DOMContentLoaded', async () => {
    // Elementos do DOM
    const form = document.getElementById('cadastroForm');
    const nomeInput = document.getElementById('nome');
    const tipoUsuarioSelect = document.getElementById('tipoUsuario');
    const iniciarBtn = document.getElementById('iniciarReconhecimento');
    const salvarBtn = document.getElementById('salvarCadastro');
    const statusElement = document.getElementById('status');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    // Variáveis de estado
    let isDetecting = false;

    // Aguarda um pouco para garantir que o face-api.js foi carregado
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        // Inicializa o reconhecedor facial
        FaceRecognition.init(video, canvas);
        
        // Carrega os modelos do face-api.js
        statusElement.textContent = 'Carregando modelos de IA...';
        await FaceRecognition.loadModels();
        
        statusElement.textContent = 'Sistema pronto - Preencha os dados e inicie o reconhecimento';
        
    } catch (err) {
        console.error('Falha na inicialização:', err);
        statusElement.textContent = 'Erro ao carregar recursos do sistema';
        return;
    }

    // Event Listener para iniciar reconhecimento
    iniciarBtn.addEventListener('click', async () => {
        if (!nomeInput.value.trim() || !tipoUsuarioSelect.value) {
            alert('Preencha nome e tipo de usuário primeiro!');
            return;
        }

        try {
            iniciarBtn.disabled = true;
            salvarBtn.disabled = true;
            statusElement.textContent = 'Iniciando detecção facial...';

            // Configura os dados do cadastro no FaceRecognition
            FaceRecognition.setCadastroData(nomeInput.value.trim(), tipoUsuarioSelect.value);

            // Inicia a detecção
            await FaceRecognition.startDetection();
            isDetecting = true;

            // Aguarda captura do descritor (máximo 15 segundos)
            statusElement.textContent = 'Posicione seu rosto na frente da câmera...';
            const descriptor = await aguardarDescriptor(15000);

            if (!descriptor) {
                throw new Error('Não foi possível capturar seu rosto. Tente novamente.');
            }

            // Para a detecção
            FaceRecognition.stopDetection();
            isDetecting = false;

            statusElement.textContent = 'Rosto capturado! Pronto para salvar.';
            salvarBtn.disabled = false;
            iniciarBtn.textContent = 'Reconhecimento Concluído ✓';

        } catch (error) {
            console.error('Erro no reconhecimento:', error);
            statusElement.textContent = 'Erro no reconhecimento - Tente novamente';
            alert(error.message || 'Erro durante o reconhecimento facial');
            
            // Reabilita botões
            iniciarBtn.disabled = false;
            iniciarBtn.textContent = 'Iniciar Reconhecimento';
            salvarBtn.disabled = true;
            
            // Para detecção se ainda estiver ativa
            if (isDetecting) {
                FaceRecognition.stopDetection();
                isDetecting = false;
            }
        }
    });

    // Event Listener para salvar cadastro
    salvarBtn.addEventListener('click', async () => {
        try {
            salvarBtn.disabled = true;
            statusElement.textContent = 'Salvando cadastro...';

            // Usa o método saveFaceDescriptor do FaceRecognizer
            await FaceRecognition.saveFaceDescriptor();

            // Sucesso - limpa o formulário
            form.reset();
            iniciarBtn.disabled = false;
            iniciarBtn.textContent = 'Iniciar Reconhecimento';
            salvarBtn.disabled = true;
            statusElement.textContent = 'Cadastro realizado com sucesso! Pronto para novo cadastro.';

        } catch (error) {
            console.error('Erro no cadastro:', error);
            statusElement.textContent = 'Erro ao salvar - Tente novamente';
            
            // Trata erros específicos
            if (error.message && error.message.includes('409')) {
                alert('Este rosto já está cadastrado no sistema!');
            } else if (error.message && error.message.includes('fetch')) {
                alert('Erro de conexão. Verifique se o servidor está rodando.');
            } else {
                alert('Erro ao salvar cadastro: ' + (error.message || 'Erro desconhecido'));
            }
            
            salvarBtn.disabled = false;
        }
    });

    // Função para aguardar captura do descritor
    function aguardarDescriptor(timeout = 15000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let lastStatusUpdate = 0;
            
            const verificarDescriptor = () => {
                const descriptor = FaceRecognition.getDescriptor();
                const currentTime = Date.now();
                
                // Atualiza status a cada 2 segundos
                if (currentTime - lastStatusUpdate > 2000) {
                    const elapsed = Math.floor((currentTime - startTime) / 1000);
                    const remaining = Math.max(0, Math.floor(timeout / 1000) - elapsed);
                    statusElement.textContent = `Detectando rosto... (${remaining}s restantes)`;
                    lastStatusUpdate = currentTime;
                }
                
                if (descriptor && descriptor.length > 0) {
                    console.log('Descritor capturado com sucesso:', descriptor.length, 'dimensões');
                    resolve(descriptor);
                    return;
                }

                // Verifica timeout
                if (currentTime - startTime > timeout) {
                    reject(new Error('Tempo esgotado: não foi possível detectar um rosto'));
                    return;
                }

                // Tenta novamente após 300ms
                setTimeout(verificarDescriptor, 300);
            };

            verificarDescriptor();
        });
    }

    // Event Listener para o form (previne submit tradicional)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!salvarBtn.disabled) {
            salvarBtn.click();
        }
    });

    // Limpeza quando a página for fechada
    window.addEventListener('beforeunload', () => {
        if (isDetecting) {
            FaceRecognition.stopDetection();
        }
    });
});