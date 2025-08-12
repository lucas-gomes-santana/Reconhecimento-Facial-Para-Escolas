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
    let rostoCaptured = false;
    let verificacaoAprovada = false;

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
        showError('Não foi possível inicializar o sistema de reconhecimento facial.');
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
            rostoCaptured = false;
            verificacaoAprovada = false;
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
            rostoCaptured = true;

            statusElement.textContent = 'Rosto capturado! Verificando se já existe no banco de dados...';

            // Verifica se o rosto já existe no sistema
            const verificacao = await verificarRostoExistente(descriptor);
            
            if (verificacao.existe) {
                // Rosto já existe - mostra informações e não permite cadastro
                mostrarRostoExistente(verificacao.dados);
                iniciarBtn.textContent = 'Rosto Já Cadastrado ❌';
                salvarBtn.disabled = true;
            } else {
                // Rosto não existe - pode prosseguir com cadastro
                mostrarRostoNovo();
                iniciarBtn.textContent = 'Reconhecimento Concluído ✓';
                salvarBtn.disabled = false;
                verificacaoAprovada = true;
            }

        } catch (error) {
            console.error('Erro no reconhecimento:', error);
            statusElement.textContent = 'Erro no reconhecimento - Tente novamente';
            showError(error.message || 'Erro durante o reconhecimento facial');
            
            // Reabilita botões
            resetarBotoes();
            
            // Para detecção se ainda estiver ativa
            if (isDetecting) {
                FaceRecognition.stopDetection();
                isDetecting = false;
            }
        }
    });

    // Event Listener para salvar cadastro
    salvarBtn.addEventListener('click', async () => {
        if (!verificacaoAprovada) {
            alert('Execute o reconhecimento facial primeiro!');
            return;
        }

        try {
            salvarBtn.disabled = true;
            statusElement.textContent = 'Salvando cadastro...';

            // Usa o método saveFaceDescriptor do FaceRecognizer
            await FaceRecognition.saveFaceDescriptor();

            // Sucesso - limpa o formulário
            form.reset();
            resetarBotoes();
            limparResultados();
            statusElement.textContent = 'Cadastro realizado com sucesso! Pronto para novo cadastro.';
            showSuccess('Usuário cadastrado com sucesso no sistema!');

        } catch (error) {
            console.error('Erro no cadastro:', error);
            statusElement.textContent = 'Erro ao salvar - Tente novamente';
            
            // Trata erros específicos
            if (error.message && error.message.includes('409')) {
                showError('Este rosto já está cadastrado no sistema!');
            } else if (error.message && error.message.includes('fetch')) {
                showError('Erro de conexão. Verifique se o servidor está rodando.');
            } else {
                showError('Erro ao salvar cadastro: ' + (error.message || 'Erro desconhecido'));
            }
            
            salvarBtn.disabled = false;
        }
    });

    // Verifica se o rosto já existe no banco de dados
    async function verificarRostoExistente(descriptor) {
        try {
            console.log('Verificando se rosto já existe...');
            
            const response = await fetch('http://localhost:3000/api/verificar-rosto', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    descriptor: descriptor 
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                existe: data.encontrado,
                dados: data.encontrado ? {
                    usuario: data.usuario,
                    similaridade: data.similaridade,
                    distancia: data.distancia
                } : null
            };

        } catch (error) {
            console.error('Erro ao verificar rosto existente:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Não foi possível conectar ao servidor para verificar duplicatas.');
            }
            throw error;
        }
    }

    // Mostra que o rosto já está cadastrado
    function mostrarRostoExistente(dados) {
        statusElement.textContent = 'Verificação concluída - Rosto já cadastrado';
        
        const nivelConfianca = dados.similaridade ? getNivelConfianca(dados.similaridade) : '';
        
        // Cria ou atualiza elemento de resultado
        let resultadoElement = document.getElementById('resultado-verificacao');
        if (!resultadoElement) {
            resultadoElement = document.createElement('div');
            resultadoElement.id = 'resultado-verificacao';
            resultadoElement.className = 'resultado-container';
            statusElement.parentNode.insertBefore(resultadoElement, statusElement.nextSibling);
        }

        resultadoElement.innerHTML = `
            <div class="resultado-erro">
                <h3>❌ Rosto já cadastrado!</h3>
                <div class="usuario-info">
                    <p><strong>Este rosto já pertence a:</strong></p>
                    <p><strong>Nome:</strong> ${escapeHtml(dados.usuario.nome)}</p>
                    <p><strong>Tipo:</strong> ${escapeHtml(dados.usuario.tipoUsuario)}</p>
                    <p><strong>Cadastrado em:</strong> ${formatarData(dados.usuario.dataCadastro)}</p>
                    <p><strong>Similaridade:</strong> ${(dados.similaridade * 100).toFixed(1)}%</p>
                    ${nivelConfianca ? `<p class="confianca"><strong>Confiança:</strong> ${nivelConfianca}</p>` : ''}
                </div>
                <div class="acoes-duplicata">
                    <p><strong>Ações disponíveis:</strong></p>
                    <button onclick="tentarNovamente()" class="btn-action">🔄 Tentar com Outro Rosto</button>
                    <button onclick="irParaVerificacao()" class="btn-action">🔍 Ir para Verificação</button>
                </div>
            </div>
        `;
        resultadoElement.classList.add('nao-encontrado');
    }

    // Mostra que o rosto é novo e pode ser cadastrado
    function mostrarRostoNovo() {
        statusElement.textContent = 'Verificação concluída - Rosto aprovado para cadastro';
        
        // Cria ou atualiza elemento de resultado
        let resultadoElement = document.getElementById('resultado-verificacao');
        if (!resultadoElement) {
            resultadoElement = document.createElement('div');
            resultadoElement.id = 'resultado-verificacao';
            resultadoElement.className = 'resultado-container';
            statusElement.parentNode.insertBefore(resultadoElement, statusElement.nextSibling);
        }

        resultadoElement.innerHTML = `
            <div class="resultado-sucesso">
                <h3>✅ Rosto aprovado!</h3>
                <div class="aprovacao-info">
                    <p>Este rosto não está cadastrado no sistema.</p>
                    <p><strong>Pode prosseguir com o cadastro de:</strong></p>
                    <p><strong>Nome:</strong> ${escapeHtml(nomeInput.value)}</p>
                    <p><strong>Tipo:</strong> ${escapeHtml(tipoUsuarioSelect.value)}</p>
                    <p class="instrucao">👆 Clique em "Salvar Cadastro" para finalizar</p>
                </div>
            </div>
        `;
        resultadoElement.classList.add('encontrado');
    }

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

    // Funções auxiliares
    function resetarBotoes() {
        iniciarBtn.disabled = false;
        iniciarBtn.textContent = 'Iniciar Reconhecimento';
        salvarBtn.disabled = true;
        rostoCaptured = false;
        verificacaoAprovada = false;
    }

    function limparResultados() {
        const resultadoElement = document.getElementById('resultado-verificacao');
        if (resultadoElement) {
            resultadoElement.remove();
        }
    }

    function getNivelConfianca(similaridade) {
        if (similaridade >= 0.8) {
            return '<span style="color: #28a745;">Muito Alto 🟢</span>';
        } else if (similaridade >= 0.6) {
            return '<span style="color: #ffc107;">Alto 🟡</span>';
        } else if (similaridade >= 0.4) {
            return '<span style="color: #fd7e14;">Médio 🟠</span>';
        } else {
            return '<span style="color: #dc3545;">Baixo 🔴</span>';
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    }

    function formatarData(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString || 'Data não disponível';
        }
    }

    function showError(message) {
        let resultadoElement = document.getElementById('resultado-verificacao');
        if (!resultadoElement) {
            resultadoElement = document.createElement('div');
            resultadoElement.id = 'resultado-verificacao';
            resultadoElement.className = 'resultado-container';
            statusElement.parentNode.insertBefore(resultadoElement, statusElement.nextSibling);
        }

        resultadoElement.innerHTML = `
            <div class="resultado-erro">
                <h3>⚠️ Erro</h3>
                <p>${escapeHtml(message)}</p>
                <button onclick="tentarNovamente()" class="btn-retry">🔄 Tentar Novamente</button>
            </div>
        `;
        resultadoElement.classList.add('nao-encontrado');
    }

    function showSuccess(message) {
        let resultadoElement = document.getElementById('resultado-verificacao');
        if (!resultadoElement) {
            resultadoElement = document.createElement('div');
            resultadoElement.id = 'resultado-verificacao';
            resultadoElement.className = 'resultado-container';
            statusElement.parentNode.insertBefore(resultadoElement, statusElement.nextSibling);
        }

        resultadoElement.innerHTML = `
            <div class="resultado-sucesso">
                <h3>✅ Sucesso!</h3>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
        resultadoElement.classList.add('encontrado');
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

    // Funções globais para botões
    window.tentarNovamente = () => {
        resetarBotoes();
        limparResultados();
        statusElement.textContent = 'Sistema pronto - Preencha os dados e inicie o reconhecimento';
    };

    window.irParaVerificacao = () => {
        if (confirm('Deseja ir para a página de verificação?')) {
            window.location.href = '../pages/comparar.html';
        }
    };
});