/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useAdminPage } from '../hooks/frontend/useAdminPage';
import '../styles/index.css';
import { Search, AlertTriangle, Users, Loader, Trash2 } from 'lucide-react';

function AdminPage() {
    const {
        nome,
        senha,
        funcao,
        setNome,
        setSenha,
        setFuncao,
        loading,
        loadingList,
        message,
        handleCadastrarAdmin,
        carregarAdmins,
        getTotalAdmins,
        buscarAdmins,
        admins,
        carregarMaisAdmins,
        searchTerm,
        removerAdmin,
        hasMore,
        formatData,
    } = useAdminPage();

    const [adminParaRemover, setAdminParaRemover] = useState<string | null>(null);
    const [removendoAdmin, setRemovendoAdmin] = useState<string | null>(null);

    // Carregar admins na inicialização
    useEffect(() => {
        console.log("Carregando Admins...");
        carregarAdmins(true);
    }, []);

    // Scroll infinito
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >= 
                document.documentElement.offsetHeight - 1000 &&
                !loadingList &&
                hasMore
            ) {
                carregarMaisAdmins();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [carregarMaisAdmins, loadingList, hasMore]);

    // Função para remover admin com confirmação
    const handleRemoverAdmin = async (nome: string) => {
        setRemovendoAdmin(nome);
        const sucesso = await removerAdmin(nome);

        if (sucesso) {
            setAdminParaRemover(null);
        }

        setRemovendoAdmin(null);
    };

    const confirmarRemocao = (nome: string) => {
        setAdminParaRemover(nome);
    };

    const cancelarRemocao = () => {
        setAdminParaRemover(null);
    };

    // Função para obter cores baseadas no tipo de admin
    const getTipoAdminColor = (tipo: string) => {
        switch (tipo.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'seguranca':
            case 'segurança':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };


    return (
        <>
            {/* Seção de Cadastro */}
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Página do Diretor
                        </h1>
                        <h2 className="text-lg text-gray-600">
                            Cadastre ou exclua administradores e seguranças no sistema C.E.R.F
                        </h2>
                    </div>

                    {/* Mensagens de Feedback */}
                    {message.texto && (
                        <div className={`mb-6 p-4 rounded-lg border ${
                            message.tipo === 'success' 
                                ? 'bg-green-100 border-green-300 text-green-700' 
                                : 'bg-red-100 border-red-300 text-red-700'
                        }`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {/* Ícones de sucesso/erro */}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{message.texto}</p>
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
                                        Nome do Administrador/Segurança:
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
                                        Senha para o Usuário:
                                    </label>
                                    <input
                                        type="text"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Crie uma senha segura"
                                        required
                                        disabled={loading}
                                        minLength={6}
                                    />
                                </div>

                                {/* Campo Função */}
                                <div>
                                    <label htmlFor="tipoGestor" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo do Usuário:
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

                            {/* Botão de Submit */}
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                            Cadastrando...
                                        </div>
                                    ) : (
                                        'Cadastrar Usuário'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Seção de Gerenciamento */}
                <section className="mt-30 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <Users className="h-8 w-8 text-white" />
                                    <h1 className="text-3xl font-bold text-white">Gerenciamento de Adms</h1>
                                </div>
                                <p className="text-blue-100">
                                    {getTotalAdmins() > 0 
                                        ? `${getTotalAdmins()} usuário${getTotalAdmins() > 1 ? 's' : ''}/segurança${getTotalAdmins() > 1 ? 's' : ''}  ${searchTerm ? 'encontrado' : 'cadastrado'}${getTotalAdmins() > 1 ? 's' : ''}`
                                        : searchTerm 
                                            ? 'Nenhum usuário encontrado' 
                                            : 'Nenhum usuário cadastrado'
                                    }
                                </p>
                            </div>

                            {/* Barra de Pesquisa */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar por nome ou função..."
                                        value={searchTerm}
                                        onChange={(e) => buscarAdmins(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Conteúdo Principal */}
                            <div className="p-6">
                                {/* Lista de Usuários */}
                                {admins.length === 0 && !loadingList ? (
                                    <div className="text-center py-12">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                                        </h3>
                                        <p className="text-gray-500">
                                            {searchTerm 
                                                ? 'Tente buscar com outros termos' 
                                                : 'Cadastre o primeiro usuário usando o formulário acima'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {admins.map((usuario) => (
                                            <div
                                                key={usuario._id}
                                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {usuario.nome}
                                                        </h3>
                                                        <div className="mt-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTipoAdminColor(usuario.funcao)}`}>
                                                                {usuario.funcao === 'admin' ? 'Administrador' : 'Segurança'}
                                                            </span>
                                                        </div>
                                                       <p className="text-sm text-gray-500 mt-2">
                                                            Cadastrado em {formatData(usuario.dataCadastro)}
                                                        </p>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => confirmarRemocao(usuario.nome)}
                                                        disabled={removendoAdmin === usuario.nome}
                                                        className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Remover usuário"
                                                    >
                                                        {removendoAdmin === usuario.nome ? (
                                                            <Loader className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Indicador de Carregamento */}
                                {loadingList && (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                                        <span className="text-gray-600">Carregando usuários...</span>
                                    </div>
                                )}

                                {/* Indicador de Fim da Lista */}
                                {!hasMore && admins.length > 0 && (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500">
                                            {searchTerm 
                                                ? 'Todos os resultados foram carregados'
                                                : 'Todos os usuários foram carregados'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modal de Confirmação de Remoção */}
                    {adminParaRemover && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-md w-full p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Confirmar Remoção
                                    </h3>
                                </div>
                                
                                <p className="text-gray-600 mb-6">
                                    Tem certeza que deseja remover o usuário <strong>{adminParaRemover}</strong>? 
                                    Esta ação não pode ser desfeita.
                                </p>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={cancelarRemocao}
                                        disabled={removendoAdmin === adminParaRemover}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleRemoverAdmin(adminParaRemover)}
                                        disabled={removendoAdmin === adminParaRemover}
                                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {removendoAdmin === adminParaRemover ? (
                                            <>
                                                <Loader className="h-4 w-4 animate-spin" />
                                                Removendo...
                                            </>
                                        ) : (
                                            'Remover'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            
        </>
    );
}

export default AdminPage;