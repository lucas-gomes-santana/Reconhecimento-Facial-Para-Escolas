import { useEffect, useState } from "react";
import { Search, AlertTriangle, Users, Loader, Trash2 } from "lucide-react";
import { useAdminPage } from "../hooks/frontend/useAdminPage";
import { useFormatData } from "../hooks/utils/useFormatData";
import { formatarFuncao, getTipoAdminColor } from "../utils/roleMapping";
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

  return (
    <main className="cerf-scan-bg min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Card de Cadastro */}
        <div className="cerf-surface p-6">
          <h1 className="cerf-heading text-2xl mb-2">Página do Diretor</h1>
          <p className="cerf-subtext text-sm mb-6">
            Cadastre ou exclua administradores e seguranças no sistema C.E.R.F
          </p>

          {/* Mensagens de Feedback */}
          {message.texto && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.tipo === "success"
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "cerf-alert-error cerf-alert-error-text"
              }`}
            >
              <p className="text-sm font-medium">{message.texto}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleCadastrarAdmin} className="space-y-4">
            <div>
              <label className="cerf-label block mb-2">Nome do Gestor</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="cerf-input px-4 py-3"
                placeholder="Digite o nome completo"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="cerf-label block mb-2">Senha para o Gestor</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="cerf-input px-4 py-3"
                  placeholder="Crie uma senha segura"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>

              <div>
                <label htmlFor="tipoGestor" className="cerf-label block mb-2">
                  Tipo do Gestor
                </label>
                <select
                  id="tipoGestor"
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  required
                  disabled={loading}
                  className="cerf-input px-4 py-3"
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
              className="cerf-btn-primary w-full md:w-auto py-3 px-8"
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
        <div className="cerf-surface overflow-hidden">
          <div className="cerf-band-dark px-6 py-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Gerenciamento de Gestores</h2>
            </div>
            <p className="cerf-band-dark-subtext text-sm">
              {getTotalAdmins() > 0
                ? `${getTotalAdmins()} gestor${getTotalAdmins() > 1 ? "es" : ""} cadastrado${getTotalAdmins() > 1 ? "s" : ""}`
                : searchTerm
                  ? "Nenhum gestor encontrado"
                  : "Nenhum gestor cadastrado"}
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
                className="cerf-input pl-10 pr-4 py-2"
              />
            </div>

            {/* Lista de Admins */}
            {admins.length === 0 && !loadingList ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="cerf-heading text-lg mb-2">
                  {searchTerm ? "Nenhum gestor encontrado" : "Nenhum gestor cadastrado"}
                </h3>
                <p className="cerf-subtext text-sm">
                  {searchTerm
                    ? "Tente buscar com outros termos"
                    : "Cadastre o primeiro gestor usando o formulário acima"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="cerf-list-row flex items-start justify-between p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="cerf-heading text-lg">{admin.nome}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoAdminColor(admin.funcao)}`}
                        >
                          {formatarFuncao(admin.funcao)}
                        </span>
                      </div>
                      <p className="cerf-subtext text-sm">
                        Cadastrado em: {formatData(admin.dataCadastro)}
                      </p>
                    </div>

                    <button
                      onClick={() => confirmarRemocao(admin._id)}
                      disabled={removendoAdmin === admin._id}
                      className="cerf-icon-btn-danger ml-3 p-2"
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
                <Loader className="h-6 w-6 animate-spin cerf-accent-text mr-2" />
                <span className="cerf-subtext">Carregando gestores...</span>
              </div>
            )}

            {!hasMore && admins.length > 0 && (
              <div className="text-center py-6">
                <p className="cerf-subtext text-sm">Todos os gestores foram carregados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {adminParaRemover && (
        <div className="cerf-modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="cerf-surface max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="cerf-modal-icon-danger flex-shrink-0 w-12 h-12 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" style={{ color: "var(--cerf-danger)" }} />
              </div>
              <h3 className="cerf-heading text-xl">Confirmar Remoção</h3>
            </div>

            <p className="cerf-subtext mb-6">
              Tem certeza que deseja remover o gestor{" "}
              <strong className="cerf-heading">
                {admins.find((u) => u._id === adminParaRemover)?.nome}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelarRemocao}
                disabled={removendoAdmin === adminParaRemover}
                className="cerf-btn-neutral px-5 py-2.5"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoverAdmin(adminParaRemover)}
                disabled={removendoAdmin === adminParaRemover}
                className="cerf-btn-danger px-5 py-2.5 flex items-center gap-2"
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
