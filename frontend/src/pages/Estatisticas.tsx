import { useEffect, useState } from "react";
import { useEstatisticas } from "../hooks/frontend/useEstatisticas";
import { useGerarRelatorio } from "../hooks/utils/useGerarRelatorio";
import { useFormatData } from "../hooks/utils/useFormatData";
import type { UsuarioPorTipo } from "../types/user.types";
import type { DadosEstatisticas } from "../types/estatisticas.types";
import "../styles/index.css";

function Estatisticas() {
  const {
    loading,
    error,
    estatisticas,
    mostrandoDetalhes,
    carregarEstatisticas,
    resetarEstatisticas,
    toggleDetalhes,
    clearError,
  } = useEstatisticas();

  const { gerarRelatorio, loading: loadingRelatorio, error: errorRelatorio } = useGerarRelatorio();

  const { formatData } = useFormatData();

  const [, setLastRefresh] = useState<string>("");

  useEffect(() => {
    // Carrega estatísticas ao montar o componente
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    try {
      await carregarEstatisticas(mostrandoDetalhes);
      setLastRefresh(formatData(new Date().toISOString()));
    } catch (err) {
      console.error("Erro ao atualizar estatísticas:", err);
    }
  };

  const handleReset = async () => {
    const confirmacao = confirm(
      "Tem certeza que deseja reiniciar o contador de verificações? Esta ação não pode ser desfeita.",
    );

    if (!confirmacao) return;

    try {
      await resetarEstatisticas();
      setLastRefresh(formatData(new Date().toISOString()));
      alert("Quantidade de verificações reiniciadas com sucesso!");
    } catch (err) {
      console.error("Erro ao reiniciar verificações:", err);
    }
  };

  const handleToggleDetalhes = async () => {
    try {
      await toggleDetalhes();
    } catch (err) {
      console.error("Erro ao alternar detalhes:", err);
    }
  };

  const handleGerarRelatorio = async () => {
    try {
      await gerarRelatorio();
      alert("Relatório gerado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      alert(`Erro ao gerar relatório: ${errorRelatorio || "Erro desconhecido"}`);
    }
  };

  const renderEstatisticas = () => {
    if (!estatisticas) {
      return (
        <div className="text-center">
          <p className="cerf-subtext">Carregando estatísticas...</p>
        </div>
      );
    }

    const stats = estatisticas as DadosEstatisticas;

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-9">
          <div className="cerf-stat-card p-4">
            <h3 className="cerf-stat-card-title text-lg">Total de Cadastros</h3>
            <span className="cerf-stat-card-value text-3xl">{stats.totalCadastros}</span>
          </div>
          <div className="cerf-stat-card-alt p-4">
            <h3 className="cerf-stat-card-alt-title text-lg">Total de Verificações</h3>
            <span className="cerf-stat-card-alt-value text-3xl">{stats.totalVerificacoes}</span>
          </div>
        </div>

        {mostrandoDetalhes && stats.usuariosPorTipo && (
          <div className="cerf-panel-muted p-4 mb-4">
            <h3 className="cerf-heading text-lg mb-3">Usuários por Tipo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stats.usuariosPorTipo.map((tipo: UsuarioPorTipo, index: number) => (
                <div
                  key={index}
                  className="cerf-panel-muted-item flex justify-between p-2 cerf-subtext"
                >
                  <strong className="cerf-heading">{tipo._id}:</strong>
                  <span>{tipo.quantidade} usuário(s)</span>
                </div>
              ))}
            </div>
            {stats.primeiroCadastro && (
              <div className="cerf-accent-bg mt-4 p-3 rounded-md">
                <p>
                  <strong>Primeiro cadastro:</strong> {formatData(stats.primeiroCadastro)}
                </p>
              </div>
            )}
            {stats.ultimoCadastro && (
              <div className="cerf-accent-bg mt-4 p-3 rounded-md">
                <p>
                  <strong>Último cadastro:</strong> {formatData(stats.ultimoCadastro)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-base cerf-subtext text-center">
          <p>Última atualização dos dados: {formatData(stats.ultimaAtualizacao)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="cerf-scan-bg min-h-screen flex flex-col">
      <header className="cerf-band-dark text-center p-6">
        <h1 className="text-xl md:text-3xl font-bold">📊 Estatísticas do C.E.R.F</h1>
      </header>

      <main className="flex-1 p-10 grid grid-cols-1 gap-8">
        <section className="cerf-surface p-4">
          <h2 className="cerf-heading mb-4 text-lg md:text-xl">Controles</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="cerf-btn-success flex-1 min-w-[150px] py-2 px-4"
            >
              {loading ? "⏳ Carregando..." : "🔄 Atualizar"}
            </button>
            <button
              onClick={handleToggleDetalhes}
              disabled={loading}
              className="cerf-btn-info flex-1 min-w-[150px] py-2 px-4"
            >
              📋 {mostrandoDetalhes ? "Ocultar Detalhes" : "Mostrar Detalhes"}
            </button>
            <button
              onClick={handleGerarRelatorio}
              disabled={loading || loadingRelatorio}
              className="cerf-btn-primary flex-1 min-w-[150px] py-2 px-4"
            >
              {loadingRelatorio ? "⏳ Gerando..." : "📄 Gerar Relatório"}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="cerf-btn-danger flex-1 min-w-[150px] py-2 px-4"
            >
              🔄 Reiniciar Verificações
            </button>
          </div>
        </section>

        <section className="cerf-surface p-6">
          <h2 className="cerf-heading mb-5 text-lg md:text-xl">Dados do Sistema</h2>
          {error && (
            <div className="cerf-alert-error mb-4 p-4">
              <p className="cerf-alert-error-text">⚠️ Erro: {error}</p>
              <button onClick={clearError} className="cerf-btn-neutral mt-2 px-3 py-1 text-sm">
                Fechar
              </button>
            </div>
          )}
          {renderEstatisticas()}
        </section>
      </main>

      <footer className="cerf-band-dark text-center p-4 text-sm">
        <p className="cerf-band-dark-subtext">
          Os dados são atualizados automaticamente conforme novos cadastros e verificações são
          realizados.
        </p>
      </footer>
    </div>
  );
}

export default Estatisticas;
