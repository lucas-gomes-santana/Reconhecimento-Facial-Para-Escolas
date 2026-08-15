/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Search, AlertTriangle, Users, Loader, Trash2 } from "lucide-react";

import { useAdminPage } from "../hooks/frontend/useAdminPage";
import { useFormatData } from "../hooks/utils/useFormatData";
import "../styles/index.css";

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
    } = useAdminPage();

    const { formatData } = useFormatData();

    const [adminParaRemover, setAdminParaRemover] = useState<string | null>(null);
    const [removendoAdmin, setRemovendoAdmin] = useState<string | null>(null);

    useEffect(() => {
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

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [carregarMaisAdmins, loadingList, hasMore]);

    const handleRemoverAdmin = async (_id: string) => {
        setRemovendoAdmin(_id);
        const sucesso = await removerAdmin(_id);

        if (sucesso) {
            setAdminParaRemover(null);
        }

        setRemovendoAdmin(null);
    };

    const confirmarRemocao = (_id: string) => {
        setAdminParaRemover(_id);
    };

    const cancelarRemocao = () => {
        setAdminParaRemover(null);
    };

    const getTipoAdminColor = (tipo: string) => {
        switch (tipo.toLowerCase()) {
            case "admin":
                return "bg-purple-100 text-purple-800 border border-purple-200";
            case "seguranca":
            case "segurança":
                return "bg-red-100 text-red-800 border border-red-200";
            case "super-admin":
                return "bg-green-100 text-green-800 border border-green-200";
            case "desenvolvedor": 
                return "bg-yellow-100 text-yellow-800 border border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    const formatarFuncao = (funcao: string) => {
        switch (funcao.toLowerCase()) {
            case "admin":
                return "Administrador";
            case "seguranca":
            case "segurança":
                return "Segurança";
            case "super-admin":
                return "Super Admin";
            case "desenvolvedor":
                return "Desenvolvedor";
            default:
                return funcao;
        }
    };

    return (
        <main className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Card de Cadastro */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">
                        Página do Diretor
                    </h1>
                    <p className="text-[#1E3A8A] text-sm mb-6">
                        Cadastre ou exclua administradores e seguranças no sistema C.E.R.F
                    </p>

                    {/* Mensagens de Feedback */}
                    {message.texto && (
                        <div className={`mb-6 p-4 rounded-lg border ${
                            message.tipo === "success" 
                                ? "bg-green-100 border-green-300 text-green-700" 
                                : "bg-red-100 border-red-300 text-red-700"
                        }`}>
                            <p className="text-sm font-medium">{message.texto}</p>
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleCadastrarAdmin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                                Nome do Gestor
                            </label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all"
                                placeholder="Digite o nome completo"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#1E3A8A] mb-2">
                                    Senha para o Gestor
                                </label>
                                <input
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all"
                                    placeholder="Crie uma senha segura"
                                    required
                                    disabled={loading}
                                    minLength={8}
                                />
                            </div>

                            <div>
                                <label htmlFor="tipoGestor" className="block text-sm font-medium text-[#1E3A8A] mb-2">
                                    Tipo do Gestor
                                </label>
                                <select
                                    id="tipoGestor"
                                    value={funcao}
                                    onChange={(e) => setFuncao(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none focus:border-[#1E3A8A] transition-all"
                                >
                                    <option value="">Selecione</option>
                                    <option value="admin">Administrador</option>
                                    <option value="seguranca">Segurança</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto bg-[#5B21B6] hover:bg-[#4C1D95] disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#5B21B6] focus:ring-offset-2 shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader className="h-5 w-5 animate-spin" />
                                    Cadastrando...
                                </div>
                            ) : (
                                "Cadastrar Gestor"
                            )}
                        </button>
                    </form>
                </div>

                {/* Seção de Gerenciamento */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-[#1E3A8A] px-6 py-6">
                        <div className="flex items-center gap-2 mb-2 text-white">
                            <Users className="w-6 h-6" />
                            <h2 className="text-2xl font-bold">Gerenciamento de Gestores</h2>
                        </div>
                        <p className="text-purple-200 text-sm">
                            {getTotalAdmins() > 0 
                                ? `${getTotalAdmins()} gestor${getTotalAdmins() > 1 ? "es" : ""} cadastrado${getTotalAdmins() > 1 ? "s" : ""}`
                                : searchTerm 
                                    ? "Nenhum gestor encontrado" 
                                    : "Nenhum gestor cadastrado"
                            }
                        </p>
                    </div>

                    <div className="p-6">
                        {/* Barra de Pesquisa */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou função"
                                value={searchTerm}
                                onChange={(e) => buscarAdmins(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all"
                            />
                        </div>

                        {/* Lista de Admins */}
                        {admins.length === 0 && !loadingList ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? "Nenhum gestor encontrado" : "Nenhum gestor cadastrado"}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {searchTerm 
                                        ? "Tente buscar com outros termos" 
                                        : "Cadastre o primeiro gestor usando o formulário acima"
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {admins.map((admin) => (
                                    <div
                                        key={admin._id}
                                        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-[#0D47A1]/30 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-[#1E3A8A]">
                                                    {admin.nome}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoAdminColor(admin.funcao)}`}>
                                                    {formatarFuncao(admin.funcao)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Cadastrado em: {formatData(admin.dataCadastro)}
                                            </p>
                                        </div>
                                        
                                        <button
                                            onClick={() => confirmarRemocao(admin._id)}
                                            disabled={removendoAdmin === admin._id}
                                            className="ml-3 p-2 text-gray-400  hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Remover gestor"
                                        >
                                            {removendoAdmin === admin._id ? (
                                                <Loader className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loadingList && (
                            <div className="flex justify-center items-center py-8">
                                <Loader className="h-6 w-6 animate-spin text-[#1E3A8A] mr-2" />
                                <span className="text-gray-600">Carregando gestores...</span>
                            </div>
                        )}

                        {!hasMore && admins.length > 0 && (
                            <div className="text-center py-6">
                                <p className="text-gray-400 text-sm">
                                    Todos os gestores foram carregados
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação */}
            {adminParaRemover && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Confirmar Remoção
                            </h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja remover o gestor <strong>{admins.find(u => u._id === adminParaRemover)?.nome}</strong>? 
                            Esta ação não pode ser desfeita.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelarRemocao}
                                disabled={removendoAdmin === adminParaRemover}
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleRemoverAdmin(adminParaRemover)}
                                disabled={removendoAdmin === adminParaRemover}
                                className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                            >
                                {removendoAdmin === adminParaRemover ? (
                                    <>
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Removendo...
                                    </>
                                ) : (
                                    "Remover"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminPage;