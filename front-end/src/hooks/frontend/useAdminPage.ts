import { useCallback, useState } from "react";

interface AdminData {
    nome: string;
    senha: string;
    funcao: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    admin?: {
        id: string;
        nome: string;
        funcao: string;
    };
    error?: string;
}

export const useAdminPage = () => {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [funcao, setFuncao] = useState('');
    
    // Estados para controle de UI
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState<{tipo: 'success' | 'error' | '', texto: string}>({
        tipo: '',
        texto: ''
    });

    const baseURL = 'http://localhost:3000/api/admin/cadastrar';

    // Função para gerar senha aleatória
    const gerarSenhaAleatoria = useCallback(() => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
        let novaSenha = '';
        for (let i = 0; i < 10; i++) {
            novaSenha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        setSenha(novaSenha);
        return novaSenha;
    }, []);

    // Função para limpar o formulário
    const limparFormulario = useCallback(() => {
        setNome('');
        setSenha('');
        setFuncao('');
    }, []);

    // Função para cadastrar admin
    const handleCadastrarAdmin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validações básicas
        if (!nome.trim()) {
            setMensagem({
                tipo: 'error',
                texto: 'Nome é obrigatório!'
            });
            return;
        }

        if (!senha) {
            setMensagem({
                tipo: 'error',
                texto: 'Senha é obrigatória!'
            });
            return;
        }

        if (!funcao) {
            setMensagem({
                tipo: 'error',
                texto: 'Função é obrigatória!'
            });
            return;
        }

        setLoading(true);
        setMensagem({ tipo: '', texto: '' });

        try {
            const userData: AdminData = {
                nome: nome.trim(),
                senha,
                funcao
            };

            const response = await fetch(`${baseURL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.success) {
                setMensagem({
                    tipo: 'success',
                    texto: `${funcao === 'admin' ? 'Administrador' : 'Segurança'} ${nome} cadastrado com sucesso!`
                });
                
                // Limpar formulário após sucesso
                limparFormulario();
                
            } else {
                setMensagem({
                    tipo: 'error',
                    texto: data.message || 'Erro ao cadastrar usuário!'
                });
            }

        } catch (error) {
            console.error("Erro no cadastro de admin:", error);
            setMensagem({
                tipo: 'error',
                texto: 'Erro de conexão com o servidor!'
            });
        } finally {
            setLoading(false);
        }

        // Limpar mensagem após 5 segundos
        setTimeout(() => {
            setMensagem({ tipo: '', texto: '' });
        }, 5000);

    }, [nome, senha, funcao, limparFormulario]);

    return {
        // Estados do formulário
        nome,
        senha,
        funcao,
        
        // Setters
        setNome,
        setSenha,
        setFuncao,
        
        // Estados de controle
        loading,
        mensagem,
        
        // Funções
        handleCadastrarAdmin,
        gerarSenhaAleatoria,
        limparFormulario
    };
};