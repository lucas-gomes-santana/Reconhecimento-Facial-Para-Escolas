import { useCallback, useState } from "react";
import { useAuth } from "../auth/useAuth";

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

    // Hook de autenticação
    const { authenticatedFetch, isAdmin, admin } = useAuth();

    // Função para limpar o formulário
    const limparFormulario = useCallback(() => {
        setNome('');
        setSenha('');
        setFuncao('');
    }, []);

    // Função para cadastrar admin COM JWT
    const handleCadastrarAdmin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Verificar se usuário é admin antes de prosseguir
        if (!isAdmin()) {
            setMensagem({
                tipo: 'error',
                texto: 'Apenas administradores podem cadastrar novos usuários!'
            });
            return;
        }

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

            // Usar authenticatedFetch para incluir automaticamente o token JWT
            const response = await authenticatedFetch('http://localhost:3000/api/admin/cadastrar', {
                method: 'POST',
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

        } catch (error: any) {
            console.error("Erro no cadastro de admin:", error);
            
            if (error.message.includes('Sessão expirada')) {
                setMensagem({
                    tipo: 'error',
                    texto: 'Sessão expirada. Você será redirecionado para o login.'
                });
            } else {
                setMensagem({
                    tipo: 'error',
                    texto: 'Erro de conexão com o servidor!'
                });
            }
        } finally {
            setLoading(false);
        }


    }, [nome, senha, funcao, authenticatedFetch, isAdmin, limparFormulario]);

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
        
        // Dados do usuário logado
        admin,
        isAdmin: isAdmin(),
        
        // Funções
        handleCadastrarAdmin,
        limparFormulario
    };
};