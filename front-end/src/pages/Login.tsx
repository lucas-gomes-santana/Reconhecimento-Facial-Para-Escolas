import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';
import '../styles/index.css';

function Login() {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        // Validações básicas
        if (!nome || !senha) {
            setError('Todos os campos são obrigatórios!');
            return;
        }

        try {
            const result = await login(nome, senha);

            if (result.success) {
                if (result.admin?.funcao === 'admin' || result.admin?.funcao === 'seguranca') {
                    navigate('/home');
                } else { 
                    setError("Acesso não autorizado!");
                }
            }

        } catch (error) {
            setError('Erro inesperado. Tente novamente.');
            console.error('Erro no login:', error);
        }
    }
    const toggleMostrarSenha = () => {
        setMostrarSenha(!mostrarSenha);
    };

    return (
        <>
            <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Sistema C.E.R.F
                        </h1>
                        <p className="text-gray-600">
                            Acesse sua conta para continuar
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label
                                htmlFor="usuario"
                                className="block text-sm font-medium text-gray-700 mb-2"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        transition-colors"
                                placeholder="Digite seu nome de usuário"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="senha"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={mostrarSenha ? "text" : "password"}
                                    id="senha"
                                    value={senha}
                                    onChange={(e) => {
                                        setSenha(e.target.value);
                                        setError('');
                                    }}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                            transition-colors pr-12" // pr-12 para espaço do botão
                                    placeholder="Digite sua senha"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={toggleMostrarSenha}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center 
                                             text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={loading}
                                >
                                    {mostrarSenha ? (
                                        // Ícone de olho fechado (esconder senha)
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        // Ícone de olho aberto (mostrar senha)
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 text-white font-semibold rounded-lg 
                                    bg-blue-600 hover:bg-blue-700 cursor-pointer focus:outline-none 
                                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all
                                    disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md
                                    hover:shadow-lg transform hover:scale-105"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Validando...
                                </div>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
export default Login;