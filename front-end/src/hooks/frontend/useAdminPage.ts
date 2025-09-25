/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { AdminData, AdminSign } from "../../types/admin.types";
import type { ApiResponse } from "../../types/api.types";
import { baseURL } from "../../config/url";


const ADMINS_PER_PAGE = 10;

interface MessageState {
    texto: string;
    tipo: 'success' | 'error';
}

export const useAdminPage = () => {
    // Estados do formulário
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [funcao, setFuncao] = useState('');
    
    // Estados da lista dez admins
    const [todosAdmins, setTodosAdmins] = useState<AdminData[]>([]);
    const [adminsExibidos, setAdminsExibidos] = useState<AdminData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    
    // Estados para controle de UI
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [message, setMessage] = useState<MessageState>({ texto: '', tipo: 'success' });

    const { 
        authenticatedFetch, 
        isAdmin, 
        isDesenvolvedor, 
        isSuperAdmin, 
        admin 
    } = useAuth();


    const limparFormulario = useCallback(() => {
        setNome('');
        setSenha('');
        setFuncao('');
    }, []);

    // Função para cadastrar admin COM JWT
    const handleCadastrarAdmin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Verificar se usuário é super-usuário ou desenvolvedor antes de cadastrar
        if (!isSuperAdmin() && !isDesenvolvedor()) {
            setMessage({ 
                texto: "Apenas o super-admin ou o desenvolvedor podem cadastrar Admins e Seguranças!", 
                tipo: 'error' 
            });
            return;
        }

        if (!funcao) {
            setMessage({ 
                texto: "Função é obrigatória", 
                tipo: 'error' 
            });
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
        }

    }, [nome, senha, funcao, authenticatedFetch, isAdmin, limparFormulario]);

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
            
            // CORRIGIDO: Mapeamento dos dados
            const admins = Array.isArray(data) ? data.map(admin => ({
                _id: admin._id, // CORRIGIDO: era "id"
                nome: admin.nome,
                funcao: admin.funcao,
                // CORRIGIDO: Mantido fallback para compatibilidade
                dataCadastro: admin.dataCadastro || admin.createdAt
            })) : [];

            console.log('Admins carregados do servidor:', admins); // Debug

            // CORRIGIDO: Lógica simplificada
            setTodosAdmins(admins);
            if (reset) {
                setPage(1);
            }

        } catch (error) {
            console.error("Erro ao carregar os admins:", error);
            setMessage({ 
                texto: "Erro ao carregar lista de usuários", 
                tipo: 'error' 
            });
        } finally {
            setLoadingList(false);
        }
    }, [loadingList, authenticatedFetch]);

    // Função para remover admin
    const removerAdmin = useCallback(async (nome: string): Promise<boolean> => {
        if (!nome) return false;

        try {
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
                
                return true;

            } else {
                const errorData = await response.json();
                setMessage({ 
                    texto: errorData.message || "Erro ao remover usuário", 
                    tipo: 'error' 
                });
                return false;
            }

        } catch (error) {
            console.error("Erro ao remover admin:", error);
            setMessage({ 
                texto: "Erro de conexão ao remover usuário", 
                tipo: 'error' 
            });
            return false;
        }
    }, [authenticatedFetch]);

    // Função para atualizar admins exibidos com paginação
    const atualizarAdminsExibidos = useCallback(() => {
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
        atualizarAdminsExibidos();
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
                year: 'numeric'
            });
        } catch (error) {
            console.error(error);
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