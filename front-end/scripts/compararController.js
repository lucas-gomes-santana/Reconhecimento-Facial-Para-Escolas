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
        
        statusElement.textContent = 'Sistema pronto - Clique para verificar seu cadastro';
        btnVerificar.disabled = false;
        btnVerificar.textContent = 'Iniciar Verificação';
        
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
            btnVerificar.textContent = 'Verificando...';
            statusElement.textContent = 'Posicione seu rosto na frente da câmera...';
            resultadoElement.innerHTML = '';
            resultadoElement.className = 'resultado-container';

            // Inicia a detecção facial
            await FaceRecognition.startDetection();
            
            // Aguarda captura do descritor facial (máximo 15 segundos)
            const descriptor = await aguardarDescriptor(15000);
            
            if (!descriptor) {
                throw new Error('Não foi possível detectar um rosto claro. Verifique se há iluminação adequada e tente novamente.');
            }

            // Para a detecção
            FaceRecognition.stopDetection();
            statusElement.textContent = 'Rosto capturado! Buscando no banco de dados...';

            // Verifica no servidor
            await verificarNoServidor(descriptor);

        } catch (error) {
            console.error('Erro na verificação:', error);
            showError(error.message || 'Erro durante a verificação facial');
        } finally {
            // Reabilita o botão
            btnVerificar.disabled = false;
            btnVerificar.textContent = 'Nova Verificação';
            // Para a detecção caso ainda esteja ativa
            FaceRecognition.stopDetection();
        }
    }

    // Aguarda até que um descritor facial seja capturado com feedback visual
    function aguardarDescriptor(timeout = 15000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let lastStatusUpdate = 0;
            let tentativas = 0;
            
            const verificarDescriptor = () => {
                const descriptor = FaceRecognition.getDescriptor();
                const currentTime = Date.now();
                tentativas++;
                
                // Atualiza status a cada 2 segundos
                if (currentTime - lastStatusUpdate > 2000) {
                    const elapsed = Math.floor((currentTime - startTime) / 1000);
                    const remaining = Math.max(0, Math.floor(timeout / 1000) - elapsed);
                    statusElement.textContent = `Detectando rosto... (${remaining}s restantes) - Mantenha-se na frente da câmera`;
                    lastStatusUpdate = currentTime;
                }
                
                if (descriptor && descriptor.length > 0) {
                    console.log(`Descritor capturado após ${tentativas} tentativas:`, descriptor.length, 'dimensões');
                    resolve(descriptor);
                    return;
                }

                // Verifica timeout
                if (currentTime - startTime > timeout) {
                    reject(new Error('Tempo esgotado: não foi possível detectar um rosto. Certifique-se de que há luz suficiente e que seu rosto está visível.'));
                    return;
                }

                // Tenta novamente após 200ms (mais rápido para melhor detecção)
                setTimeout(verificarDescriptor, 200);
            };

            verificarDescriptor();
        });
    }

    // Envia descritor para o servidor e processa resposta
    async function verificarNoServidor(descriptor) {
        try {
            console.log('Enviando descritor para verificação:', descriptor.length, 'dimensões');
            
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
                throw new Error(errorData.message || `Erro HTTP: ${response.status} - Verifique se o servidor está funcionando`);
            }

            const data = await response.json();
            exibirResultado(data);

        } catch (error) {
            console.error('Erro na comunicação com servidor:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando na porta 3000.');
            }
            throw error;
        }
    }

    // Exibe o resultado da verificação na interface
    function exibirResultado(data) {
        statusElement.textContent = 'Verificação concluída';

        if (data.encontrado && data.usuario) {
            // Usuário encontrado
            const similaridadeTexto = data.similaridade ? 
                `<p><strong>Precisão da identificação:</strong> ${(data.similaridade * 100).toFixed(1)}%</p>` : '';
            
            const nivelConfianca = data.similaridade ? getNivelConfianca(data.similaridade) : '';
            
            resultadoElement.innerHTML = `
                <div class="resultado-sucesso">
                    <h3>✅ Cadastro encontrado!</h3>
                    <div class="usuario-info">
                        <p><strong>Nome:</strong> ${escapeHtml(data.usuario.nome)}</p>
                        <p><strong>Tipo de usuário:</strong> ${escapeHtml(data.usuario.tipoUsuario)}</p>
                        <p><strong>Data do cadastro:</strong> ${formatarData(data.usuario.dataCadastro)}</p>
                        ${similaridadeTexto}
                        ${nivelConfianca ? `<p class="confianca"><strong>Nível de confiança:</strong> ${nivelConfianca}</p>` : ''}
                    </div>
                </div>
            `;
            resultadoElement.classList.add('encontrado');
            
        } else {
            // Usuário não encontrado
            resultadoElement.innerHTML = `
                <div class="resultado-erro">
                    <h3>❌ Cadastro não encontrado</h3>
                    <p>Este rosto não foi encontrado no banco de dados do sistema.</p>
                    <div class="sugestoes">
                        <h4>Possíveis motivos:</h4>
                        <ul>
                            <li>Você ainda não está cadastrado no sistema</li>
                            <li>A iluminação pode estar inadequada</li>
                            <li>Seu rosto pode estar parcialmente coberto</li>
                            <li>O ângulo da câmera pode estar inadequado</li>
                        </ul>
                        <p><strong>Sugestões:</strong></p>
                        <ul>
                            <li>Tente novamente com melhor iluminação</li>
                            <li>Posicione seu rosto de frente para a câmera</li>
                            <li>Se o problema persistir, procure o administrador</li>
                        </ul>
                    </div>
                </div>
            `;
            resultadoElement.classList.add('nao-encontrado');
        }
    }

    // Determina nível de confiança baseado na similaridade
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

    // Exibe mensagem de erro
    function showError(message) {
        statusElement.textContent = 'Erro na verificação';
        resultadoElement.innerHTML = `
            <div class="resultado-erro">
                <h3>⚠️ Erro na Verificação</h3>
                <p>${escapeHtml(message)}</p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="btn-retry">🔄 Recarregar Página</button>
                    <button onclick="iniciarVerificacao()" class="btn-retry" style="margin-left: 10px;">🔄 Tentar Novamente</button>
                </div>
            </div>
        `;
        resultadoElement.classList.add('nao-encontrado');
    }

    // Função auxiliar para escapar HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
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
            console.error('Erro ao formatar data:', error);
            return dateString || 'Data não disponível';
        }
    }

    // Expõe função para uso global (para botões de retry)
    window.iniciarVerificacao = iniciarVerificacao;
});