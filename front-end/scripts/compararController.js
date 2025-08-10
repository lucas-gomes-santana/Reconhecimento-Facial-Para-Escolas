document.addEventListener('DOMContentLoaded', async () => {
    // Elementos do DOM
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const btnVerificar = document.getElementById('iniciarVerificacao');
    const statusElement = document.getElementById('status');
    const resultadoElement = document.getElementById('resultado');

    // Desabilita o botão inicialmente
    btnVerificar.disabled = true;
    
    // Aguarda um pouco para garantir que o face-api.js foi carregado
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        // Inicializa o reconhecedor facial
        FaceRecognition.init(video, canvas);
        
        // Carrega os modelos do face-api.js
        statusElement.textContent = 'Carregando modelos de IA...';
        await FaceRecognition.loadModels();
        
        statusElement.textContent = 'Sistema pronto - Clique para verificar';
        btnVerificar.disabled = false;
        
    } catch (err) {
        console.error('Falha na inicialização:', err);
        statusElement.textContent = 'Erro ao carregar recursos do sistema';
        showError('Não foi possível inicializar o sistema de reconhecimento facial.');
        return;
    }

    // Event Listener para o botão de verificação
    btnVerificar.addEventListener('click', async () => {
        await iniciarVerificacao();
    });

    // Função principal de verificação
    async function iniciarVerificacao() {
        try {
            // Desabilita botão e limpa resultados anteriores
            btnVerificar.disabled = true;
            statusElement.textContent = 'Posicione seu rosto na frente da câmera...';
            resultadoElement.innerHTML = '';
            resultadoElement.className = 'resultado-container';

            // Inicia a detecção facial
            await FaceRecognition.startDetection();
            
            // Aguarda captura do descritor facial (máximo 10 segundos)
            const descriptor = await aguardarDescriptor(10000);
            
            if (!descriptor) {
                throw new Error('Não foi possível detectar um rosto. Tente novamente.');
            }

            // Para a detecção
            FaceRecognition.stopDetection();
            statusElement.textContent = 'Rosto capturado! Verificando no banco de dados...';

            // Verifica no servidor
            await verificarNoServidor(descriptor);

        } catch (error) {
            console.error('Erro na verificação:', error);
            showError(error.message || 'Erro durante a verificação');
        } finally {
            // Reabilita o botão
            btnVerificar.disabled = false;
            // Para a detecção caso ainda esteja ativa
            FaceRecognition.stopDetection();
        }
    }

    // Aguarda até que um descritor facial seja capturado
    function aguardarDescriptor(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const verificarDescriptor = () => {
                const descriptor = FaceRecognition.getDescriptor();
                
                if (descriptor && descriptor.length > 0) {
                    console.log('Descritor capturado com sucesso');
                    resolve(descriptor);
                    return;
                }

                // Verifica timeout
                if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout: não foi possível detectar um rosto'));
                    return;
                }

                // Tenta novamente após 500ms
                setTimeout(verificarDescriptor, 500);
            };

            verificarDescriptor();
        });
    }

    // Envia descritor para o servidor e processa resposta
    async function verificarNoServidor(descriptor) {
        try {
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
            exibirResultado(data);

        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
            }
            throw error;
        }
    }

    // Exibe o resultado da verificação na interface
    function exibirResultado(data) {
        statusElement.textContent = 'Verificação concluída';

        if (data.encontrado && data.usuario) {
            // Usuário encontrado
            resultadoElement.innerHTML = `
                <div class="resultado-sucesso">
                    <h3>✅ Cadastro encontrado!</h3>
                    <div class="usuario-info">
                        <p><strong>Nome:</strong> ${escapeHtml(data.usuario.nome)}</p>
                        <p><strong>Tipo de usuário:</strong> ${escapeHtml(data.usuario.tipoUsuario)}</p>
                        <p><strong>Data do cadastro:</strong> ${formatarData(data.usuario.dataCadastro)}</p>
                        ${data.similaridade ? `<p><strong>Similaridade:</strong> ${(data.similaridade * 100).toFixed(1)}%</p>` : ''}
                    </div>
                </div>
            `;
            resultadoElement.classList.add('encontrado');
            
        } else {
            // Usuário não encontrado
            resultadoElement.innerHTML = `
                <div class="resultado-erro">
                    <h3>❌ Cadastro não encontrado</h3>
                    <p>Este rosto não está cadastrado no sistema.</p>
                    <p>Se você deveria estar cadastrado, tente novamente ou procure o administrador.</p>
                </div>
            `;
            resultadoElement.classList.add('nao-encontrado');
        }
    }

    // Exibe mensagem de erro
    function showError(message) {
        statusElement.textContent = 'Erro na verificação';
        resultadoElement.innerHTML = `
            <div class="resultado-erro">
                <h3>⚠️ Erro</h3>
                <p>${escapeHtml(message)}</p>
                <button onclick="location.reload()" class="btn-retry">Tentar Novamente</button>
            </div>
        `;
        resultadoElement.classList.add('nao-encontrado');
    }

    // Função auxiliar para escapar HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Função auxiliar para formatar data
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
            return dateString;
        }
    }
});