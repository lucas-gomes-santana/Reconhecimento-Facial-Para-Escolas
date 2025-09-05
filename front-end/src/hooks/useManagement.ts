import { useState, useCallback, useEffect } from 'react';

interface Usuario {
  _id: string;
  nome: string;
  tipoUsuario: string;
  dataCadastro: string;
}

export const useUserManagement = () => {
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);
  const [usuariosExibidos, setUsuariosExibidos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const USERS_PER_PAGE = 15;

  // Carregar todos os usuários da API
  const carregarUsuarios = useCallback(async (reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/usuarios', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      const usuarios = Array.isArray(data) ? data : [];
      
      if (reset) {
        setTodosUsuarios(usuarios);
        setPage(1);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(errorMessage);
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Remover usuário
  const removerUsuario = useCallback(async (nome: string) => {
    if (!nome) return false;
    
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${encodeURIComponent(nome)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      // Remover usuário das listas locais
      setTodosUsuarios(prev => prev.filter(usuario => usuario.nome !== nome));
      setUsuariosExibidos(prev => prev.filter(usuario => usuario.nome !== nome));

      // Notificar outros hooks sobre a mudança (opcional)
      window.dispatchEvent(new CustomEvent('userDeleted', { detail: { nome } }));

      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover usuário';
      setError(errorMessage);
      console.error('Erro ao remover usuário:', err);
      return false;
    }
  }, []);

  // Atualizar usuários exibidos baseado na pesquisa e paginação
  const atualizarUsuariosExibidos = useCallback(() => {
    let usuariosFiltrados = todosUsuarios;

    // Aplicar filtro de pesquisa se houver termo
    if (searchTerm.trim()) {
      usuariosFiltrados = todosUsuarios.filter(usuario =>
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar paginação
    const usuariosParaExibir = usuariosFiltrados.slice(0, page * USERS_PER_PAGE);
    setUsuariosExibidos(usuariosParaExibir);

    // Verificar se há mais usuários para carregar
    setHasMore(usuariosFiltrados.length > usuariosParaExibir.length);
  }, [todosUsuarios, searchTerm, page]);

  // Atualizar usuários exibidos quando dependências mudarem
  useEffect(() => {
    atualizarUsuariosExibidos();
  }, [atualizarUsuariosExibidos]);

  // Carregar mais usuários (aumentar página)
  const carregarMaisUsuarios = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  // Buscar usuários (atualizar termo de pesquisa)
  const buscarUsuarios = useCallback((termo: string) => {
    setSearchTerm(termo);
    setPage(1); // Resetar para primeira página
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Formatir data
  const formatarData = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }, []);

  // Obter total de usuários (considerando filtro)
  const getTotalUsuarios = useCallback(() => {
    if (searchTerm.trim()) {
      return todosUsuarios.filter(usuario =>
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())
      ).length;
    }
    return todosUsuarios.length;
  }, [todosUsuarios, searchTerm]);

  return {
    usuarios: usuariosExibidos,
    loading,
    error,
    searchTerm,
    hasMore,
    totalUsuarios: getTotalUsuarios(),
    carregarUsuarios,
    removerUsuario,
    carregarMaisUsuarios,
    buscarUsuarios,
    clearError,
    formatarData
  };
};