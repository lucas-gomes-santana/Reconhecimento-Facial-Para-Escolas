import { useState } from 'react';
import { useAdminPage } from '../hooks/frontend/useAdminPage';
import '../styles/index.css';

function AdminPage() {
    const {
        nome,
        senha,
        funcao,
        setNome,
        setSenha,
        setFuncao,
        loading,
        mensagem,
        handleCadastrarAdmin,
    } = useAdminPage();

    const [mostrarSenha, setMostrarSenha] = useState(false);

    return (
        <>
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Página do Diretor
                        </h1>
                        <h2 className="text-lg text-gray-600">
                            Cadastre novos administradores e seguranças para o C.E.R.F
                        </h2>
                    </div>

                    {/* Mensagens de Feedback */}
                    {mensagem.texto && (
                        <div className={`mb-6 p-4 rounded-lg border ${
                            mensagem.tipo === 'success' 
                                ? 'bg-green-100 border-green-300 text-green-700' 
                                : 'bg-red-100 border-red-300 text-red-700'
                        }`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {mensagem.tipo === 'success' ? (
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{mensagem.texto}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Formulário */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <form onSubmit={handleCadastrarAdmin}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Campo Nome */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome do Gestor:
                                    </label>
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Digite o nome completo"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Campo Senha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha para o Gestor:
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={mostrarSenha ? "text" : "password"}
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Digite ou gere uma senha"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarSenha(!mostrarSenha)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            disabled={loading}
                                        >
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                {mostrarSenha ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Campo Função */}
                                <div>
                                    <label htmlFor="tipoGestor" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo do Gestor:
                                    </label>
                                    <select
                                        id="tipoGestor"
                                        value={funcao}
                                        onChange={(e) => setFuncao(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="admin">Administrador</option>
                                        <option value="seguranca">Segurança</option>
                                    </select>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Cadastrando...
                                        </div>
                                    ) : (
                                        'Cadastrar Gestor'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}

export default AdminPage;