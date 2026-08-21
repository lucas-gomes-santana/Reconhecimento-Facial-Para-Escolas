import { useState, useCallback, useEffect } from "react";
import type { Usuario } from "../../types/user.types";
import { baseURL } from "../../config/url";
import { useAuth } from "../auth/useAuth";

export const useUserManagement = () => {
  const [todosUsuarios, setTodosUsuarios] = useState<Usuario[]>([]);
  const [usuariosExibidos, setUsuariosExibidos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [removendo, setRemovendo] = useState(false);

  const USERS_PER_PAGE = 30;

  const { authenticatedFetch } = useAuth();

  const carregarUsuarios = useCallback(
    async (reset: boolean = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const response = await authenticatedFetch(`${baseURL}/usuarios/listar`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
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
        console.error("Erro ao carregar usuários:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  const removerUsuario = useCallback(async (_id: string) => {
    if (!_id) return false;
    setError(null);

    try {
      const response = await authenticatedFetch(`${baseURL}/usuarios/remover/${_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      // Remover usuário das listas locais
      setTodosUsuarios((prev) => prev.filter((usuario) => usuario._id !== _id));
      setUsuariosExibidos((prev) => prev.filter((usuario) => usuario._id !== _id));

      window.dispatchEvent(new CustomEvent("userDeleted", { detail: { _id } }));

      return true;
    } catch (err) {
      console.error("Erro ao remover usuário:", err);
      return false;
    }
  }, []);

  const removerTodosOsUsuarios = useCallback(async () => {
    const confirmar = window.confirm(
      "Tem certeza que deseja remover TODOS os usuários do C.E.R.F? Esta ação não poderá ser desfeita",
    );
    if (!confirmar) return;

    setRemovendo(true);

    try {
      const response = await authenticatedFetch(`${baseURL}/usuarios/remover-todos`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      setTodosUsuarios([]);
      setUsuariosExibidos([]);
      setPage(1);
      setHasMore(false);

      if (!response.ok) {
        setError(data.message);
      }

      window.dispatchEvent(new CustomEvent("allUsersDeleted"));
    } catch (error: unknown) {
      console.error("Erro ao remover os usuários:", error);
      setError("Erro ao remover os usuários. Tente novamente.");
    } finally {
      setRemovendo(false);
    }
  }, [baseURL, authenticatedFetch]);

  const atualizarUsuariosExibidos = useCallback(() => {
    let usuariosFiltrados = todosUsuarios;

    if (searchTerm.trim()) {
      usuariosFiltrados = todosUsuarios.filter(
        (usuario) =>
          usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          usuario.tipoUsuario.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    const usuariosParaExibir = usuariosFiltrados.slice(0, page * USERS_PER_PAGE);
    setUsuariosExibidos(usuariosParaExibir);

    setHasMore(usuariosFiltrados.length > usuariosParaExibir.length);
  }, [todosUsuarios, searchTerm, page]);

  useEffect(() => {
    atualizarUsuariosExibidos();
  }, [atualizarUsuariosExibidos]);

  const carregarMaisUsuarios = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  const buscarUsuarios = useCallback((termo: string) => {
    setSearchTerm(termo);
    setPage(1);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getTotalUsuarios = useCallback(() => {
    if (searchTerm.trim()) {
      return todosUsuarios.filter((usuario) =>
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()),
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
    removerTodosOsUsuarios,
    carregarMaisUsuarios,
    buscarUsuarios,
    clearError,
    removendo,
    setRemovendo,
  };
};
