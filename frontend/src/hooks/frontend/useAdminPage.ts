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
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [funcao, setFuncao] = useState('');
    const [todosAdmins, setTodosAdmins] = useState<AdminData[]>([]);
    const [adminsExibidos, setAdminsExibidos] = useState<AdminData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
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

    const handleCadastrarAdmin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
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
                
                limparFormulario();
                await carregarAdmins(true);
                
            } else {
                setMessage({ 
                    texto: data.message || "Erro ao cadastrar usuário!", 
                    tipo: 'error' 
                });
            }

        } catch (error: unknown) {
            console.error("Erro no cadastro de admin:", error);
            
            if (error instanceof Error) {
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
            }
           
        } finally {
            setLoading(false);
        }

    }, [nome, senha, funcao, authenticatedFetch, isAdmin, limparFormulario]);

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
            
            // Mapeamento dos dados
            const admins = Array.isArray(data) ? data.map(admin => ({
                _id: admin._id,
                nome: admin.nome,
                funcao: admin.funcao,
                dataCadastro: admin.dataCadastro || admin.createdAt
            })) : [];

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

    const removerAdmin = useCallback(async (_id: string): Promise<boolean> => {
        if (!_id) return false;
        
        try {
            const response = await authenticatedFetch(`${baseURL}/admin/remover/${_id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Remove o Admim das listas locais
                setTodosAdmins(prev => prev.filter(admin => admin._id !== _id));
                setAdminsExibidos(prev => prev.filter(admin => admin._id !== _id));
                
                setMessage({
                    texto: data.message || `Usuário removido com sucesso!`,
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

    useEffect(() => {
        atualizarAdminsExibidos();
    }, [atualizarAdminsExibidos]);

    const carregarMaisAdmins = useCallback(() => {
        if (!loadingList && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [loadingList, hasMore]);

    const buscarAdmins = useCallback((termo: string) => {
        setSearchTerm(termo);
        setPage(1); // Reset da página ao fazer nova busca
    }, []);

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
        nome,
        senha,
        funcao,
        setNome,
        setSenha,
        setFuncao,
        loading,
        loadingList,
        message,
        admin,
        isAdmin: isAdmin(),
        handleCadastrarAdmin,
        limparFormulario,
        todosAdmins,
        admins: adminsExibidos,
        searchTerm,
        hasMore,
        carregarAdmins,
        carregarMaisAdmins,
        buscarAdmins,
        removerAdmin,
        getTotalAdmins,
    };
};