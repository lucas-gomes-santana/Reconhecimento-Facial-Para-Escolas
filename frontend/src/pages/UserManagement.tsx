/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Trash2, Search, Users, AlertTriangle, Loader } from "lucide-react";
import { useUserManagement } from "../hooks/frontend/useUserManagement";
import { useFormatData } from "../hooks/utils/useFormatData";

function UserManagement() {
  const {
    usuarios,
    loading,
    error,
    searchTerm,
    hasMore,
    totalUsuarios,
    carregarUsuarios,
    removerUsuario,
    removerTodosOsUsuarios,
    removendo,
    carregarMaisUsuarios,
    buscarUsuarios,
    clearError,
  } = useUserManagement();

  const { formatData } = useFormatData();

  const [usuarioParaRemover, setUsuarioParaRemover] = useState<string | null>(null);
  const [removendoUsuario, setRemovendoUsuario] = useState<string | null>(null);

  useEffect(() => {
    carregarUsuarios(true);
  }, []);

  // Detectar scroll para carregar mais usuários
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        carregarMaisUsuarios();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [carregarMaisUsuarios]);

  const handleRemoverUsuario = async (_id: string) => {
    setRemovendoUsuario(_id);
    const sucesso = await removerUsuario(_id);

    if (sucesso) {
      setUsuarioParaRemover(null);
    }

    setRemovendoUsuario(null);
  };

  const confirmarRemocao = (_id: string) => {
    setUsuarioParaRemover(_id);
  };

  const cancelarRemocao = () => {
    setUsuarioParaRemover(null);
  };

  const getTipoUsuarioColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "professor":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "aluno":
        return "bg-green-100 text-green-800 border border-green-200";
      case "funcionário":
      case "funcionario":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="min-h-screen flex h-screen justify-center items-center">
      <div className="min-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header com gradiente azul */}
          <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] px-8 py-8 ">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-white" />
                  <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
                </div>
                <p className="text-[#D4E157]">
                  {totalUsuarios > 0
                    ? `${totalUsuarios} usuários cadastrados`
                    : "Nenhum usuário cadastrado"}
                </p>
              </div>

              <button
                onClick={removerTodosOsUsuarios}
                disabled={removendo}
                className="p-3 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                title="Remover todos os usuários"
              >
                {removendo ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Barra de Pesquisa com fundo branco */}
          <div className="p-6 bg-white border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={(e) => buscarUsuarios(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D47A1] focus:border-[#0D47A1] transition-all"
              />
            </div>
          </div>

          <div className="p-6 bg-white">
            {/* Mensagem de Erro */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Erro</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 transition-colors text-xl font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Lista de Usuários */}
            {usuarios.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "Tente ajustar os termos de busca"
                    : 'Clique em "Adicionar Usuário" para cadastrar o primeiro usuário'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usuarios.map((usuario) => (
                  <div
                    key={usuario._id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-[#0D47A1]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {usuario.nome}
                        </h3>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoUsuarioColor(usuario.tipoUsuario)}`}
                          >
                            {usuario.tipoUsuario}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Cadastrado em {formatData(usuario.dataCadastro)}
                        </p>
                      </div>

                      <button
                        onClick={() => confirmarRemocao(usuario._id)}
                        disabled={removendoUsuario === usuario._id}
                        className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remover usuário"
                      >
                        {removendoUsuario === usuario._id ? (
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
            {loading && (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-6 w-6 animate-spin text-[#0D47A1] mr-2" />
                <span className="text-gray-600">Carregando usuários...</span>
              </div>
            )}

            {/* Indicador de Fim da Lista */}
            {!hasMore && usuarios.length > 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "Todos os resultados foram carregados"
                    : "Todos os usuários foram carregados"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Remoção */}
      {usuarioParaRemover && (
        <div className="fixed inset-0 bg-blend-saturation flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Confirmar Remoção</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja remover o usuário{" "}
              <strong>{usuarios.find((u) => u._id === usuarioParaRemover)?.nome}</strong>? Esta ação
              não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelarRemocao}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoverUsuario(usuarioParaRemover)}
                disabled={removendoUsuario === usuarioParaRemover}
                className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {removendoUsuario === usuarioParaRemover ? (
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
    </div>
  );
}

export default UserManagement;
