class UIService {
    
    updateStatus(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    showError(message, container = null) {
        const targetContainer = container || this.getOrCreateResultContainer();
        
        targetContainer.innerHTML = `
            <div class="resultado-erro">
                <h3>⚠️ Erro</h3>
                <p>${this.escapeHtml(message)}</p>
                <button onclick="tentarNovamente()" class="btn-retry">🔄 Tentar Novamente</button>
            </div>
        `;
        targetContainer.classList.add('nao-encontrado');
    }

    showSuccess(message, container = null) {
        const targetContainer = container || this.getOrCreateResultContainer();
        
        targetContainer.innerHTML = `
            <div class="resultado-sucesso">
                <h3>✅ Sucesso!</h3>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        targetContainer.classList.add('encontrado');
    }

    showRostoExistente(dados) {
        const container = this.getOrCreateResultContainer();
        const nivelConfianca = dados.similaridade ? this.getNivelConfianca(dados.similaridade) : '';
        
        container.innerHTML = `
            <div class="resultado-erro">
                <h3>❌ Rosto já cadastrado!</h3>
                <div class="usuario-info">
                    <p><strong>Este rosto já pertence a:</strong></p>
                    <p><strong>Nome:</strong> ${this.escapeHtml(dados.usuario.nome)}</p>
                    <p><strong>Tipo:</strong> ${this.escapeHtml(dados.usuario.tipoUsuario)}</p>
                    <p><strong>Cadastrado em:</strong> ${this.formatarData(dados.usuario.dataCadastro)}</p>
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
        container.classList.add('nao-encontrado');
    }

    showRostoNovo(nome, tipoUsuario) {
        const container = this.getOrCreateResultContainer();
        
        container.innerHTML = `
            <div class="resultado-sucesso">
                <h3>✅ Rosto aprovado!</h3>
                <div class="aprovacao-info">
                    <p>Este rosto não está cadastrado no sistema.</p>
                    <p><strong>Pode prosseguir com o cadastro de:</strong></p>
                    <p><strong>Nome:</strong> ${this.escapeHtml(nome)}</p>
                    <p><strong>Tipo:</strong> ${this.escapeHtml(tipoUsuario)}</p>
                    <p class="instrucao">👆 Clique em "Salvar Cadastro" para finalizar</p>
                </div>
            </div>
        `;
        container.classList.add('encontrado');
    }

    showUsuarioEncontrado(data) {
        const container = this.getOrCreateResultContainer();
        const similaridadeTexto = data.similaridade ? 
            `<p><strong>Precisão da identificação:</strong> ${(data.similaridade * 100).toFixed(1)}%</p>` : '';
        
        const nivelConfianca = data.similaridade ? this.getNivelConfianca(data.similaridade) : '';
        
        container.innerHTML = `
            <div class="resultado-sucesso">
                <h3>✅ Cadastro encontrado!</h3>
                <div class="usuario-info">
                    <p><strong>Nome:</strong> ${this.escapeHtml(data.usuario.nome)}</p>
                    <p><strong>Tipo de usuário:</strong> ${this.escapeHtml(data.usuario.tipoUsuario)}</p>
                    <p><strong>Data do cadastro:</strong> ${this.formatarData(data.usuario.dataCadastro)}</p>
                    ${similaridadeTexto}
                    ${nivelConfianca ? `<p class="confianca"><strong>Nível de confiança:</strong> ${nivelConfianca}</p>` : ''}
                </div>
            </div>
        `;
        container.classList.add('encontrado');
    }

    showUsuarioNaoEncontrado() {
        const container = this.getOrCreateResultContainer();
        
        container.innerHTML = `
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
        container.classList.add('nao-encontrado');
    }

    getOrCreateResultContainer() {
        let container = document.getElementById('resultado-verificacao');
        if (!container) {
            container = document.createElement('div');
            container.id = 'resultado-verificacao';
            container.className = 'resultado-container';
            const statusElement = document.getElementById('status');
            statusElement.parentNode.insertBefore(container, statusElement.nextSibling);
        }
        return container;
    }

    clearResults() {
        const container = document.getElementById('resultado-verificacao');
        if (container) {
            container.remove();
        }
    }

    getNivelConfianca(similaridade) {
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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    }

    formatarData(dateString) {
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
}

// Cria uma instância global
window.UIService = new UIService();