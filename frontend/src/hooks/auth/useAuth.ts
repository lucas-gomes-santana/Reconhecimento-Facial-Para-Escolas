import { useState, useCallback, useEffect } from 'react';
import type { LoginResponse } from '../../types/login.types';
import type { AdminData } from '../../types/admin.types';
import { baseURL } from '../../config/url';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);

    const saveAuthData = useCallback((adminData: AdminData) => {
        setIsAuthenticated(true);
        setAdmin(adminData);
    }, []);

    const clearAuthData = useCallback(() => {
        setIsAuthenticated(false);
        setAdmin(null);
    }, []);

    // ✅ MOVER refreshAccessToken PARA ANTES de ser usado
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch(`${baseURL}/admin/refresh-token`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                console.log('Token renovado com sucesso');
                return true;
            }
            console.warn('Falha ao renovar token:', response.status);
            return false;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            return false;
        }
    }, []);

    const login = useCallback(async (nome: string, senha: string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${baseURL}/admin/login`, {
                method: 'POST',
                credentials: 'include',
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

    const logout = useCallback(async () => {
        try {
            await fetch(`${baseURL}/admin/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            console.log('Logout realizado com sucesso');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
        clearAuthData();
    }, [clearAuthData]);

    // ✅ AGORA verifyToken pode usar refreshAccessToken
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
            
            // ✅ Se receber 401/403, tenta refresh antes de limpar
            if (response.status === 401 || response.status === 403) {
                console.log('Token expirado, tentando renovar...');
                const refreshSuccess = await refreshAccessToken();
                
                if (refreshSuccess) {
                    // Tenta verificar novamente após renovar
                    const retryResponse = await fetch(`${baseURL}/admin/verificar`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (retryResponse.ok) {
                        const retryData = await retryResponse.json();
                        if (retryData.success && retryData.admin) {
                            saveAuthData(retryData.admin);
                            setLoading(false);
                            return true;
                        }
                    }
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
    }, [saveAuthData, clearAuthData, refreshAccessToken]);

    // ✅ authenticatedFetch também pode usar refreshAccessToken agora
    const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        let response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // ✅ Tratar 401 E 403 juntos
        if (response.status === 401 || response.status === 403) {
            console.log('Token expirado durante requisição, tentando renovar...');
            const refreshSuccess = await refreshAccessToken();
            
            if (refreshSuccess) {
                console.log('Token renovado, tentando requisição novamente...');
                // Tenta a requisição original novamente
                response = await fetch(url, {
                    ...options,
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                });
                
                // ✅ Se ainda falhar após refresh, aí sim faz logout
                if (response.status === 401 || response.status === 403) {
                    console.error('Falha na autenticação mesmo após renovar token');
                    logout();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
            } else {
                console.error('Não foi possível renovar o token');
                logout();
                throw new Error('Sessão expirada. Faça login novamente.');
            }
        }

        return response;
    }, [logout, refreshAccessToken]);

    // Verificar autenticação ao carregar o hook
    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    // ✅ Funções auxiliares de verificação de role
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