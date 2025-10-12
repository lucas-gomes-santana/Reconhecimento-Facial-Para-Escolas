/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useEstatisticas } from '../hooks/frontend/useEstatisticas';
import { useGerarRelatorio } from '../hooks/utils/useGerarRelatorio';
import { useFormatData } from '../hooks/utils/useFormatData';
import '../styles/index.css';


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

  const { 
    gerarRelatorio, 
    loading: loadingRelatorio, 
    error: errorRelatorio 
  } = useGerarRelatorio();

  const { formatData } = useFormatData();

  const [ lastRefresh, setLastRefresh] = useState<String>('');

  useEffect(() => {
    // Carrega estatísticas ao montar o componente
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    try {
      await carregarEstatisticas(mostrandoDetalhes);
      setLastRefresh(formatData(new Date().toISOString()));
    } catch (err) {
      console.error('Erro ao atualizar estatísticas:', err);
    }
  };

  const handleReset = async () => {
    const confirmacao = confirm('Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.');
    
    if (!confirmacao) return;

    try {
      await resetarEstatisticas();
      setLastRefresh(formatData(new Date().toISOString()));
      alert('Estatísticas resetadas com sucesso!');
    } catch (err) {
      console.error('Erro ao resetar estatísticas:', err);
    }
  };

  const handleToggleDetalhes = async () => {
    try {
      await toggleDetalhes();
    } catch (err) {
      console.error('Erro ao alternar detalhes:', err);
    }
  };

  const handleGerarRelatorio = async () => {
    try {
      await gerarRelatorio();
      alert('Relatório gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      alert(`Erro ao gerar relatório: ${errorRelatorio || 'Erro desconhecido'}`);
    }
  };

  const renderEstatisticas = () => {
    if (!estatisticas) {
      return (
        <div className="text-center">
          <p className="text-gray-500">Carregando estatísticas...</p>
        </div>
      );
    }

    const stats = estatisticas as any;

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800">Total de Cadastros</h3>
            <span className="text-3xl font-bold text-blue-600">{stats.totalCadastros}</span>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800">Total de Verificações</h3>
            <span className="text-3xl font-bold text-green-600">{stats.totalVerificacoes}</span>
          </div>
        </div>

        {mostrandoDetalhes && stats.usuariosPorTipo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-3">Usuários por Tipo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              {stats.usuariosPorTipo.map((tipo: any, index: number) => (
                <div key={index} className="flex justify-between p-2 bg-white rounded border">
                  <strong>{tipo._id}:</strong>
                  <span>{tipo.quantidade} usuário(s)</span>
                </div>
              ))}
              
            </div>
            {stats.primeiroCadastro && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p><strong>Primeiro cadastro:</strong> {formatData(stats.primeiroCadastro)}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-base text-gray-800 text-center">
          <p>Última atualização dos dados: {formatData(stats.ultimaAtualizacao)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-500 text-white text-center p-6">
        <h1 className="text-xl md:text-3xl font-bold">📊 Estatísticas do C.E.R.F</h1>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 gap-8">

        <section className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="mb-4 text-lg md:text-xl font-semibold">Controles</h2>
          <div className="flex gap-4 flex-wrap">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="flex-1 min-w-[150px] py-2 px-4 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Carregando...' : '🔄 Atualizar'}
            </button>
            <button 
              onClick={handleToggleDetalhes}
              disabled={loading}
              className="flex-1 min-w-[150px] py-2 px-4 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📋 {mostrandoDetalhes ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
            </button>
            <button 
              onClick={handleGerarRelatorio}
              disabled={loading || loadingRelatorio}
              className="flex-1 min-w-[150px] py-2 px-4 rounded-lg text-white bg-purple-500 hover:bg-purple-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingRelatorio ? '⏳ Gerando...' : '📄 Gerar Relatório'}
            </button>
            <button 
              onClick={handleReset}
              disabled={loading}
              className="flex-1 min-w-[150px] py-2 px-4 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Excluir Dados
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="mb-4 text-lg md:text-xl font-semibold">Dados do Sistema</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">⚠️ Erro: {error}</p>
              <button 
                onClick={clearError}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Fechar
              </button>
            </div>
          )}
          {renderEstatisticas()}
        </section>
      </main>

      <footer className="bg-blue-500 text-white text-center p-4 text-sm">
        <p>Os dados são atualizados automaticamente conforme novos cadastros e verificações são realizados.</p>
      </footer>
    </div>
  );
}

export default Estatisticas;