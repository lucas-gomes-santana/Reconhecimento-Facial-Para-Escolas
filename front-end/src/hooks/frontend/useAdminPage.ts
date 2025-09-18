import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { AdminSign } from "../../types/admin.types";
import type { ApiResponse } from "../../types/api.types";
import { baseURL } from "../../config/url";

const ADMINS_PER_PAGE = 10;

interface MessageState {
    texto: string;
    tipo: 'success' | 'error';
}

interface AdminData {
    _id: string;  // MongoDB usa _id
    nome: string;
    funcao: 'admin' | 'seguranca';
    dataCadastro: string;
}

export const useAdminPage = () => {
    // Estados do formulário
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [funcao, setFuncao] = useState('');
    
    // Estados da lista de admins
    const [todosAdmins, setTodosAdmins] = useState<AdminData[]>([]);
    const [adminsExibidos, setAdminsExibidos] = useState<AdminData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    
    // Estados para controle de UI
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [message, setMessage] = useState<MessageState>({ texto: '', tipo: 'success' });

    // Hook de autenticação
    const { authenticatedFetch, isAdmin, admin } = useAuth();

    // Função para limpar mensagens após um tempo
    const limparMensagem = useCallback(() => {
        setTimeout(() => {
            setMessage({ texto: '', tipo: 'success' });
        }, 5000);
    }, []);

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
            setMessage({ 
                texto: "Apenas administradores podem acessar esta página!", 
                tipo: 'error' 
            });
            limparMensagem();
            return;
        }

        if (!funcao) {
            setMessage({ 
                texto: "Função é obrigatória", 
                tipo: 'error' 
            });
            limparMensagem();
            return;
        }

        setLoading(true);
        setMessage({ texto: '', tipo: 'success' });

        try {
            const userData: AdminSign = {
                nome: nome.trim(),
                senha,
                funcao
            };

            // Usar authenticatedFetch para incluir automaticamente o token JWT
            const response = await authenticatedFetch(`${baseURL}/admin/cadastrar`, {
                method: 'POST',
                body: JSON.stringify(userData),
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.success) {
                setMessage({ 
                    texto: `${funcao === 'admin' ? 'Administrador' : 'Segurança'} ${nome} cadastrado com sucesso!`,
                    tipo: 'success'
                });
                
                // Limpar formulário após sucesso
                limparFormulario();
                
                // Recarregar lista de admins
                await carregarAdmins(true);
                
            } else {
                setMessage({ 
                    texto: data.message || "Erro ao cadastrar usuário!", 
                    tipo: 'error' 
                });
            }

        } catch (error: any) {
            console.error("Erro no cadastro de admin:", error);
            
            if (error.message.includes('Sessão expirada')) {
                setMessage({ 
                    texto: "Sessão encerrada. Faça login novamente.", 
                    tipo: 'error' 
                });
            } else {
                setMessage({ 
                    texto: "Erro de conexão com o servidor!", 
                    tipo: 'error' 
                });
            }
        } finally {
            setLoading(false);
            limparMensagem();
        }

    }, [nome, senha, funcao, authenticatedFetch, isAdmin, limparFormulario, limparMensagem]);

    // Função para carregar admins
    const carregarAdmins = useCallback(async (reset: boolean = false) => {
        if (loadingList) return;

        setLoadingList(true);
        
        try {
            const response = await authenticatedFetch(`${baseURL}/admin/listar`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            console.log("Dados recebidos da API:", data);
            
            // ✅ Mapear os dados corretamente - o backend já retorna dataCadastro
            // No mapeamento dos dados
            const admins = Array.isArray(data) ? data.map(admin => ({
                _id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao,
                dataCadastro: admin.dataCadastro || admin.createdAt || new Date().toISOString()
            })) : [];

            console.log("Admins mapeados:", admins);

            if (reset) {
                setTodosAdmins(admins);
                setPage(1);
            } else {
                setTodosAdmins(admins);
            }

        } catch (error) {
            console.error("Erro ao carregar os admins:", error);
            setMessage({ 
                texto: "Erro ao carregar lista de usuários", 
                tipo: 'error' 
            });
            limparMensagem();
        } finally {
            setLoadingList(false);
        }
    }, [loadingList, authenticatedFetch, limparMensagem]);

    // Função para remover admin
    const removerAdmin = useCallback(async (nome: string): Promise<boolean> => {
        if (!nome) return false;

        try {
            // ✅ Correção: Adicionar barra antes do parâmetro
            const response = await authenticatedFetch(`${baseURL}/admin/remover/${encodeURIComponent(nome)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                // Remover usuário das listas locais
                setTodosAdmins(prev => prev.filter(admin => admin.nome !== nome));
                setAdminsExibidos(prev => prev.filter(admin => admin.nome !== nome));
                
                setMessage({ 
                    texto: `Usuário ${nome} removido com sucesso!`, 
                    tipo: 'success' 
                });
                
                limparMensagem();
                return true;
            } else {
                const errorData = await response.json();
                setMessage({ 
                    texto: errorData.message || "Erro ao remover usuário", 
                    tipo: 'error' 
                });
                limparMensagem();
                return false;
            }

        } catch (error) {
            console.error("Erro ao remover admin:", error);
            setMessage({ 
                texto: "Erro de conexão ao remover usuário", 
                tipo: 'error' 
            });
            limparMensagem();
            return false;
        }
    }, [authenticatedFetch, limparMensagem]);

    // Função para atualizar admins exibidos com paginação
    const atualizarAdminsExibidos = useCallback(() => {
        console.log("atualizarAdminsExibidos chamado");
        console.log("todosAdmins:", todosAdmins);
        console.log("searchTerm:", searchTerm);
        console.log("page:", page);

        let adminsFiltrados = todosAdmins;

        // Aplicar filtro de busca
        if (searchTerm.trim()) {
            adminsFiltrados = todosAdmins.filter(admin => 
                admin.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.funcao.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Aplicar paginação
        const adminsParaExibir = adminsFiltrados.slice(0, page * ADMINS_PER_PAGE);
        setAdminsExibidos(adminsParaExibir);

        // Verificar se há mais itens para carregar
        setHasMore(adminsFiltrados.length > adminsParaExibir.length);
    }, [todosAdmins, searchTerm, page]);

    // Effect para atualizar lista quando dependências mudarem
    useEffect(() => {
        console.log("todosAdmins estado:", todosAdmins);
        console.log("adminsExibidos antes da atualização:", adminsExibidos);
        atualizarAdminsExibidos();
        console.log("adminsExibidos após atualização:", adminsExibidos);
    }, [atualizarAdminsExibidos]);

    // Função para carregar mais admins (scroll infinito)
    const carregarMaisAdmins = useCallback(() => {
        if (!loadingList && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [loadingList, hasMore]);

    // Função para buscar admins
    const buscarAdmins = useCallback((termo: string) => {
        setSearchTerm(termo);
        setPage(1); // Reset da página ao fazer nova busca
    }, []);

    // Função para formatar data
    const formatData = useCallback((dateString: string): string => {
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
            console.error("Erro ao formatar data:", error);
            return 'Data inválida';
        }
    }, []);

    // Função para obter total de admins (com filtro aplicado)
    const getTotalAdmins = useCallback(() => {
        if (searchTerm.trim()) {
            return todosAdmins.filter(admin => 
                admin.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.funcao.toLowerCase().includes(searchTerm.toLowerCase())
            ).length;
        }
        return todosAdmins.length;
    }, [todosAdmins, searchTerm]);

    return {
        // Estados do formulário
        nome,
        senha,
        funcao,
        setNome,
        setSenha,
        setFuncao,
        
        // Estados de controle
        loading,
        loadingList,
        message,
        
        // Dados do usuário autenticado
        admin,
        isAdmin: isAdmin(),
        
        // Funções do formulário
        handleCadastrarAdmin,
        limparFormulario,
        
        // Estados da lista
        todosAdmins,
        admins: adminsExibidos,
        searchTerm,
        hasMore,
        
        // Funções da lista
        carregarAdmins,
        carregarMaisAdmins,
        buscarAdmins,
        removerAdmin,
        formatData,
        getTotalAdmins,
    };
};