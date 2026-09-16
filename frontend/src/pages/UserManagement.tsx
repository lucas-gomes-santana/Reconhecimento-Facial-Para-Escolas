import { useEffect, useState } from "react";
import { Trash2, Search, Users, AlertTriangle, Loader } from "lucide-react";
import { useUserManagement } from "../hooks/frontend/useUserManagement";
import { useFormatData } from "../hooks/utils/useFormatData";
import { getTipoUsuarioColor } from "../utils/roleMapping";
import "../styles/index.css";

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

  return (
    <div className="cerf-scan-bg mt-10 flex justify-center items-center">
      <div className="min-w-4xl mx-auto">
        <div className="cerf-surface overflow-hidden">
          {/* Header com gradiente escuro/ciano */}
          <div className="cerf-band-gradient px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 cerf-accent-text" />
                  <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                </div>
                <p className="cerf-band-dark-subtext">
                  {totalUsuarios > 0
                    ? `${totalUsuarios} usuários cadastrados`
                    : "Nenhum usuário cadastrado"}
                </p>
              </div>

              <button
                onClick={removerTodosOsUsuarios}
                disabled={removendo}
                className="cerf-btn-danger p-3"
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

          {/* Barra de Pesquisa */}
          <div className="p-6 cerf-surface border-b" style={{ borderColor: "var(--cerf-border)" }}>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={(e) => buscarUsuarios(e.target.value)}
                className="cerf-input pl-10 pr-4 py-2"
              />
            </div>
          </div>

          <div className="p-6 cerf-surface">
            {/* Mensagem de Erro */}
            {error && (
              <div className="cerf-alert-error mb-6 p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 cerf-alert-error-text" />
                <div className="flex-1">
                  <p className="cerf-alert-error-text font-medium">Erro</p>
                  <p className="cerf-alert-error-text text-sm">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="cerf-alert-error-text transition-colors text-xl font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Lista de Usuários */}
            {usuarios.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="cerf-heading text-lg mb-2">
                  {searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
                </h3>
                <p className="cerf-subtext text-sm">
                  {searchTerm
                    ? "Tente ajustar os termos de busca"
                    : "Clique em Adicionar Usuário para cadastrar o primeiro usuário"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usuarios.map((usuario) => (
                  <div key={usuario._id} className="cerf-list-row p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="cerf-heading text-lg truncate">{usuario.nome}</h3>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoUsuarioColor(usuario.tipoUsuario)}`}
                          >
                            {usuario.tipoUsuario}
                          </span>
                        </div>
                        <p className="cerf-subtext text-sm mt-2">
                          Cadastrado em {formatData(usuario.dataCadastro)}
                        </p>
                      </div>

                      <button
                        onClick={() => confirmarRemocao(usuario._id)}
                        disabled={removendoUsuario === usuario._id}
                        className="cerf-icon-btn-danger ml-3 p-2"
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
                <Loader className="h-6 w-6 animate-spin cerf-accent-text mr-2" />
                <span className="cerf-subtext">Carregando usuários...</span>
              </div>
            )}

            {/* Indicador de Fim da Lista */}
            {!hasMore && usuarios.length > 0 && (
              <div className="text-center py-6">
                <p className="cerf-subtext text-sm">
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
        <div className="cerf-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="cerf-surface max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="cerf-modal-icon-danger flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" style={{ color: "var(--cerf-danger)" }} />
              </div>
              <h3 className="cerf-heading text-xl">Confirmar Remoção</h3>
            </div>

            <p className="cerf-subtext mb-6">
              Tem certeza que deseja remover o usuário{" "}
              <strong className="cerf-heading">
                {usuarios.find((u) => u._id === usuarioParaRemover)?.nome}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={cancelarRemocao} className="cerf-btn-neutral px-5 py-2.5">
                Cancelar
              </button>
              <button
                onClick={() => handleRemoverUsuario(usuarioParaRemover)}
                disabled={removendoUsuario === usuarioParaRemover}
                className="cerf-btn-danger px-5 py-2.5 flex items-center gap-2"
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
