/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Trash2, Search, Users, AlertTriangle, Loader } from 'lucide-react';
import { useUserManagement } from '../hooks/frontend/useManagement';

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
    carregarMaisUsuarios,
    buscarUsuarios,
    clearError,
    formatarData
  } = useUserManagement();

  const [usuarioParaRemover, setUsuarioParaRemover] = useState<string | null>(null);
  const [removendoUsuario, setRemovendoUsuario] = useState<string | null>(null);

  // Carregar usuários ao montar o componente
  useEffect(() => {
    carregarUsuarios(true);
  }, []);

  // Detectar scroll para carregar mais usuários
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000) {
        carregarMaisUsuarios();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [carregarMaisUsuarios]);

  const handleRemoverUsuario = async (nome: string) => {
    setRemovendoUsuario(nome);
    const sucesso = await removerUsuario(nome);
    
    if (sucesso) {
      setUsuarioParaRemover(null);
    }
    
    setRemovendoUsuario(null);
  };

  const confirmarRemocao = (nome: string) => {
    setUsuarioParaRemover(nome);
  };

  const cancelarRemocao = () => {
    setUsuarioParaRemover(null);
  };

  const getTipoUsuarioColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {

      case 'professor':
        return 'bg-blue-100 text-blue-800 border-blue-200';

      case 'aluno':
        return 'bg-green-100 text-green-800 border-green-200';

      case 'funcionário':
      case 'funcionario':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';

      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
            </div>
            <p className="text-blue-100">
              {totalUsuarios > 0 ? `${totalUsuarios} usuários cadastrados` : 'Nenhum usuário cadastrado'}
            </p>
          </div>

          {/* Barra de Pesquisa */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={(e) => buscarUsuarios(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="p-6">

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
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            {/* Lista de Usuários */}
            {usuarios.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </h3>
              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usuarios.map((usuario) => (
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTipoUsuarioColor(usuario.tipoUsuario)}`}>
                            {usuario.tipoUsuario}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Cadastrado em {formatarData(usuario.dataCadastro)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => confirmarRemocao(usuario.nome)}
                        disabled={removendoUsuario === usuario.nome}
                        className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remover usuário"
                      >
                        {removendoUsuario === usuario.nome ? (
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
                <Loader className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">Carregando usuários...</span>
              </div>
            )}

            {/* Indicador de Fim da Lista */}
            {!hasMore && usuarios.length > 0 && (
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
      {usuarioParaRemover && (
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
              Tem certeza que deseja remover o usuário <strong>{usuarioParaRemover}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelarRemocao}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoverUsuario(usuarioParaRemover)}
                disabled={removendoUsuario === usuarioParaRemover}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {removendoUsuario === usuarioParaRemover ? (
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
    </div>
  );
}

export default UserManagement;