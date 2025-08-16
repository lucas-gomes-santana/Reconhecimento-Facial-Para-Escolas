class EstatisticasController {
    constructor() {
        this.autoRefreshInterval = null;
        this.isLoading = false;
    }

    async init() {
        try {
            // Aguarda os services serem carregados
            await this.waitForServices();
            this.setupEventListeners();
            this.setupGlobalFunctions();
            
            // Carrega estatísticas iniciais
            await this.carregarEstatisticas();
            
            console.log('EstatisticasController inicializado com sucesso');
        } catch (err) {
            console.error('Falha na inicialização:', err);
            this.showError('Erro ao carregar o sistema de estatísticas');
        }
    }

    async waitForServices() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (window.ApiService) {
                console.log('ApiService carregado');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Timeout: ApiService não foi carregado');
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        const toggleDetailBtn = document.getElementById('toggleDetailBtn');
        const resetBtn = document.getElementById('resetBtn');
        const toggleAutoRefreshBtn = document.getElementById('toggleAutoRefreshBtn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefresh());
        }

        if (toggleDetailBtn) {
            toggleDetailBtn.addEventListener('click', () => this.toggleDetalhes());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
        }
    }

    async handleRefresh() {
        if (this.isLoading) return;
        await this.carregarEstatisticas();
    }

    async carregarEstatisticas(mostrarDetalhes = false) {
        try {
            this.isLoading = true;
            this.updateStatus('Carregando estatísticas...');
            this.setLoadingState(true);

            let dados;
            if (mostrarDetalhes) {
                const response = await window.ApiService.obterEstatisticasDetalhadas();
                dados = response.dados;
            } else {
                const response = await window.ApiService.obterEstatisticas();
                dados = response.dados;
            }

            this.exibirEstatisticas(dados, mostrarDetalhes);
            this.updateStatus('Estatísticas atualizadas');
            this.updateLastRefresh();

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            this.showError(error.message || 'Erro ao carregar estatísticas');
            this.updateStatus('Erro ao carregar estatísticas');
        } finally {
            this.isLoading = false;
            this.setLoadingState(false);
        }
    }

    exibirEstatisticas(dados, mostrarDetalhes = false) {
        const container = document.getElementById('estatisticasContent');
        if (!container) return;

        let html = `
            <div class="estatisticas-basicas">
                <div class="stat-item">
                    <h3>Total de Cadastros</h3>
                    <span class="stat-number">${dados.totalCadastros}</span>
                </div>
                <div class="stat-item">
                    <h3>Total de Verificações</h3>
                    <span class="stat-number">${dados.totalVerificacoes}</span>
                </div>
            </div>
        `;

        if (mostrarDetalhes && dados.usuariosPorTipo) {
            html += `
                <div class="estatisticas-detalhadas">
                    <h3>Usuários por Tipo</h3>
                    <div class="tipos-usuario">
            `;
            
            dados.usuariosPorTipo.forEach(tipo => {
                html += `
                    <div class="tipo-item">
                        <strong>${tipo._id}:</strong> ${tipo.quantidade} usuário(s)
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;

            if (dados.primeiroCadastro) {
                html += `
                    <div class="info-adicional">
                        <p><strong>Primeiro cadastro:</strong> ${this.formatarData(dados.primeiroCadastro)}</p>
                    </div>
                `;
            }
        }

        html += `
            <div class="ultima-atualizacao">
                <small>Última atualização dos dados: ${this.formatarData(dados.ultimaAtualizacao)}</small>
            </div>
        `;

        container.innerHTML = html;
    }

    async toggleDetalhes() {
        const btn = document.getElementById('toggleDetailBtn');
        if (!btn) return;

        const mostrandoDetalhes = btn.textContent.includes('Mostrar');
        
        await this.carregarEstatisticas(!mostrandoDetalhes);
        
        btn.textContent = mostrandoDetalhes ? 'Ocultar Detalhes' : 'Mostrar Detalhes';
    }

    // Função para excluir dados de contagem 
    async handleReset() {
        const confirmacao = confirm('Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.');
        
        if (!confirmacao) return;

        try {
            this.updateStatus('Resetando estatísticas...');
            this.setLoadingState(true);

            await window.ApiService.resetarEstatisticas();
            
            this.updateStatus('Estatísticas resetadas com sucesso!');
            await this.carregarEstatisticas();

        } catch (error) {
            console.error('Erro ao resetar estatísticas:', error);
            this.showError(error.message || 'Erro ao resetar estatísticas');
        } finally {
            this.setLoadingState(false);
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    updateLastRefresh() {
        const refreshElement = document.getElementById('lastRefresh');
        if (refreshElement) {
            refreshElement.textContent = `Última atualização: ${this.formatarData(new Date())}`;
        }
    }

    setLoadingState(loading) {
        const buttons = ['refreshBtn', 'toggleDetailBtn', 'resetBtn'];
        
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) btn.disabled = loading;
        });
    }

    showError(message) {
        const errorContainer = this.getOrCreateErrorContainer();
        errorContainer.innerHTML = `
            <div class="error-message">
                <strong>⚠️ Erro:</strong> ${this.escapeHtml(message)}
            </div>
        `;
        errorContainer.style.display = 'block';

        // Remove o erro após 5 segundos
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }

    getOrCreateErrorContainer() {
        let container = document.getElementById('errorContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'errorContainer';
            container.style.display = 'none';
            const mainContent = document.querySelector('main') || document.body;
            mainContent.insertBefore(container, mainContent.firstChild);
        }
        return container;
    }

    formatarData(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dateString || 'Data não disponível';
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    }

    setupGlobalFunctions() {
        // Funções para uso na página de estatísticas
        window.refreshEstatisticas = () => this.handleRefresh();
        window.toggleDetalhes = () => this.toggleDetalhes();
        window.resetEstatisticas = () => this.handleReset();
    }
}

// Inicialização automática
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('DOM carregado, inicializando EstatisticasController...');
        const controller = new EstatisticasController();
        await controller.init();
    });
} else {
    (async () => {
        console.log('DOM já carregado, inicializando EstatisticasController...');
        const controller = new EstatisticasController();
        await controller.init();
    })();
}