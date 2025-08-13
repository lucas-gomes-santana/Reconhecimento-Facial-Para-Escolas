class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }

    async cadastrarUsuario(userData) {
        try {
            const response = await fetch(`${this.baseURL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique se está rodando na porta 3000.');
            }
            throw error;
        }
    }

    async verificarRosto(descriptor) {
        try {
            const response = await fetch(`${this.baseURL}/verificar-rosto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descriptor })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }

            return {
                existe: data.encontrado,
                dados: data.encontrado ? {
                    usuario: data.usuario,
                    similaridade: data.similaridade,
                    distancia: data.distancia
                } : null
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Não foi possível conectar ao servidor para verificar duplicatas.');
            }
            throw error;
        }
    }
}

// Cria uma instância global
window.ApiService = new ApiService();