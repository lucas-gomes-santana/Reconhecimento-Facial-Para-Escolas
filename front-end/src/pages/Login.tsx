import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginResponse } from '../types/login.types';
import '../styles/index.css';


function Login() {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Função para validar login no MongoDB
    async function validateLogin(nome: string, senha: string): Promise<LoginResponse> {
        try {
            const response = await fetch('http://localhost:3000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, senha })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
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
            console.error('Erro na validação:', error);
            return {
                success: false,
                message: 'Erro de conexão com o servidor'
            };
        }
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validações básicas
        if (!nome || !senha) {
            setError('Todos os campos são obrigatórios!');
            setIsLoading(false);
            return;
        }

        try {
            const result = await validateLogin(nome, senha);
            
            // Redirecionamento caso haja sucesso no login
            if (result.success && result.admin) {
                navigate('/home');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }

    // Página de login original com funcionalidades adicionadas
    return (
        <>
            <main className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-center text-gray-800">
                        Acesse o Sistema C.E.R.F
                    </h1>

                    <div className="space-y-5">
                        

                        <div>
                            <label
                                htmlFor="usuario"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Usuário
                            </label>
                            <input
                                type="text"
                                id="usuario"
                                value={nome}
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    setError('');
                                }}
                                required
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="senha"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Senha
                            </label>
                            <input
                                type="password"
                                id="senha"
                                value={senha}
                                onChange={(e) => {
                                    setSenha(e.target.value);
                                    setError('');
                                }}
                                required
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full py-2 px-4 text-white font-semibold rounded-md 
                                    bg-blue-600 hover:bg-blue-700 cursor-pointer focus:outline-none 
                                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition
                                    disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Validando...' : 'Entrar'}
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Login;