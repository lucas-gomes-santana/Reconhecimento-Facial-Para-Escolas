import { useState, useCallback, useEffect } from 'react';
import type { LoginResponse } from '../../types/login.types';
import type { AdminData } from '../../types/admin.types';
import { baseURL } from '../../config/url';


export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);

    // Função para salvar dados de autenticação
    const saveAuthData = useCallback((adminData: AdminData) => {
        setIsAuthenticated(true);
        setAdmin(adminData);
    }, []);

    // Função para limpar dados de autenticação
    const clearAuthData = useCallback(() => {
        setIsAuthenticated(false);
        setAdmin(null);
    }, []);

    // Função de login
    const login = useCallback(async (nome: string, senha: string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${baseURL}/admin/login`, {
                method: 'POST',
                credentials: 'include', // Importante para cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, senha })
            });

            const data = await response.json();
            
            if (response.ok && data.success && data.admin) {
                saveAuthData(data.admin);
                return {
                    success: true,
                    message: 'Login realizado com sucesso',
                    admin: data.admin
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Erro na autenticação'
                };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                message: 'Erro de conexão com o servidor'
            };
        }
    }, [saveAuthData]);

    // Função de logout
    const logout = useCallback(async () => {
        try {
            await fetch(`${baseURL}/admin/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
        clearAuthData();
    }, [clearAuthData]);

    const verifyToken = useCallback(async () => {
        try {
            const response = await fetch(`${baseURL}/admin/verificar`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.admin) {
                    saveAuthData(data.admin);
                    setLoading(false);
                    return true;
                }
            }
            
            clearAuthData();
            setLoading(false);
            return false;
            
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            clearAuthData();
            setLoading(false);
            return false;
        }
    }, [saveAuthData, clearAuthData]);

    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch(`${baseURL}/admin/refresh-token`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            return false;
        }
    }, []);

    // Função fetch autenticada especial para receber os tokens JWT
    const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        let response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // Se receber 403, tenta renovar o token
        if (response.status === 403) {
            const refreshSuccess = await refreshAccessToken();
            
            if (refreshSuccess) {
                // Tenta a requisição original novamente
                response = await fetch(url, {
                    ...options,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                });
            } else {
                // Se não conseguiu renovar, faz logout
                logout();
                throw new Error('Sessão expirada. Faça login novamente.');
            }
        }

        // Se ainda receber 401, força logout
        if (response.status === 401) {
            logout();
            throw new Error('Não autorizado. Faça login novamente.');
        }

        return response;

    }, [logout, refreshAccessToken]);

    // Verificar autenticação ao carregar o hook
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    const isAdmin = useCallback(() => {
        return admin?.funcao === 'admin';
    }, [admin]);

    const isSeguranca = useCallback(() => {
        return admin?.funcao === 'seguranca';
    }, [admin]);

    const isSuperAdmin = useCallback(() => {
        return admin?.funcao === 'super-admin';
    }, [admin]);

    const isDesenvolvedor = useCallback(() => {
        return admin?.funcao === 'desenvolvedor';
    }, [admin]);


    return {
        // Estados
        isAuthenticated,
        admin,
        loading,
        
        // Funções
        login,
        logout,
        verifyToken,
        authenticatedFetch,
        refreshAccessToken,
        
        // Utilitários
        isAdmin,
        isSeguranca,
        isDesenvolvedor,
        isSuperAdmin,
    };
};