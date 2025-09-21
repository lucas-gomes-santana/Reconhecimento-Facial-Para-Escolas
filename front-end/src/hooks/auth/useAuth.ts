import { useState, useCallback, useEffect } from 'react';
import type { LoginResponse } from '../../types/login.types';
import type { AdminData } from '../../types/admin.types';
import { baseURL } from '../../config/url';


export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);

    // Chaves para localStorage
    const TOKEN_KEY = 'cerf_token';
    const ADMIN_KEY = 'cerf_admin';

    // Função para obter token
    const getToken = useCallback(() => {
        return localStorage.getItem(TOKEN_KEY);
    }, []);

    // Função para salvar dados de autenticação
    const saveAuthData = useCallback((token: string, adminData: AdminData) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
        setIsAuthenticated(true);
        setAdmin(adminData);
    }, []);

    // Função para limpar dados de autenticação
    const clearAuthData = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
        setIsAuthenticated(false);
        setAdmin(null);
    }, []);

    // Função de login
    const login = useCallback(async (nome: string, senha: string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${baseURL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, senha })
            });

            const data = await response.json();
            
            if (response.ok && data.success && data.token && data.admin) {
                saveAuthData(data.token, data.admin);
                return {
                    success: true,
                    message: 'Login realizado com sucesso',
                    token: data.token,
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
    const logout = useCallback(() => {
        clearAuthData();
    }, [clearAuthData]);

    // Função para verificar se o token ainda é válido
    const verifyToken = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return false;
        }

        try {
            const response = await fetch(`${baseURL}/admin/verificar`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.admin) {
                    setAdmin(data.admin);
                    setIsAuthenticated(true);
                    setLoading(false);
                    return true;
                }
            }
            
            // Token inválido
            clearAuthData();
            setLoading(false);
            return false;
            
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            clearAuthData();
            setLoading(false);
            return false;
        }
    }, [getToken, clearAuthData]);

    // Função para fazer requisições autenticadas
    const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        const token = getToken();
        
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Se token expirou, fazer logout
        if (response.status === 401 || response.status === 403) {
            logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        return response;
    }, [getToken, logout]);

    // Verificar autenticação ao carregar o hook
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();
            const savedAdmin = localStorage.getItem(ADMIN_KEY);

            if (token && savedAdmin) {
                try {
                    const adminData = JSON.parse(savedAdmin);
                    const isValid = await verifyToken();
                    
                    if (isValid) {
                        setAdmin(adminData);
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Erro ao recuperar dados salvos:', error);
                    clearAuthData();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [getToken, verifyToken, clearAuthData]);

    // Verificar se usuário é admin
    const isAdmin = useCallback(() => {
        return admin?.funcao === 'admin';
    }, [admin]);

    // Verificar se usuário é segurança
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
        
        // Utilitários
        isAdmin,
        isSeguranca,
        isDesenvolvedor,
        isSuperAdmin,
        getToken
    };
};