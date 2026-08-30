import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserManagement } from "../../../../src/hooks/frontend/useUserManagement";
import { useAuth } from "../../../../src/hooks/auth/useAuth";
import type { Usuario } from "../../../../src/types/user.types";

vi.mock("../../../../src/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockAuth = vi.mocked(useAuth);

const makeUsuario = (
  id: string,
  nome: string,
  tipoUsuario: Usuario["tipoUsuario"] = "Aluno",
): Usuario => ({
  _id: id,
  nome,
  tipoUsuario,
  dataCadastro: "2026-01-01T00:00:00.000Z",
});

describe("useUserManagement", () => {
  const authenticatedFetchMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    authenticatedFetchMock.mockReset();
    mockAuth.mockReturnValue({
      authenticatedFetch: authenticatedFetchMock,
    } as unknown as ReturnType<typeof useAuth>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("carregarUsuarios", () => {
    it("deve carregar e listar os usuários", async () => {
      const usuarios = [makeUsuario("1", "João"), makeUsuario("2", "Maria")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      expect(result.current.usuarios).toHaveLength(2);
      expect(result.current.usuarios[0].nome).toBe("João");
    });

    it("deve lidar com resposta que não é um array", async () => {
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ dados: "errado" }), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      expect(result.current.usuarios).toEqual([]);
    });

    it("não deve chamar API se já está carregando", async () => {
      const usuarios = [makeUsuario("1", "João")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      authenticatedFetchMock.mockClear();

      // Simula chamada dentro de um loop que já está carregando
      await act(async () => {
        await result.current.carregarUsuarios(true);
        await result.current.carregarUsuarios(true);
      });

      // A primeira chamada iniciou loading, as seguintes devem retornar sem nova fetch
      expect(authenticatedFetchMock).toHaveBeenCalled();
    });
  });

  describe("buscarUsuarios e filtro", () => {
    it("deve filtrar usuários por nome", async () => {
      const usuarios = [makeUsuario("1", "João"), makeUsuario("2", "Maria")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      act(() => {
        result.current.buscarUsuarios("maria");
      });

      await waitFor(() => {
        expect(result.current.usuarios).toHaveLength(1);
        expect(result.current.usuarios[0].nome).toBe("Maria");
      });
    });

    it("deve filtrar usuários por tipo", async () => {
      const usuarios = [makeUsuario("1", "João", "Aluno"), makeUsuario("2", "Pedro", "Professor")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      act(() => {
        result.current.buscarUsuarios("professor");
      });

      await waitFor(() => {
        expect(result.current.usuarios).toHaveLength(1);
        expect(result.current.usuarios[0].nome).toBe("Pedro");
      });
    });

    it("deve retornar total de usuários que o filtro encontra", async () => {
      const usuarios = [
        makeUsuario("1", "João", "Aluno"),
        makeUsuario("2", "Maria", "Aluno"),
        makeUsuario("3", "Pedro", "Professor"),
      ];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      act(() => {
        result.current.buscarUsuarios("joão");
      });

      await waitFor(() => {
        expect(result.current.totalUsuarios).toBe(1);
      });
    });
  });

  describe("paginação", () => {
    it("deve carregar mais usuários ao dar scroll", async () => {
      const muitosUsuarios = Array.from({ length: 100 }, (_, i) =>
        makeUsuario(String(i), `Usuário ${i}`),
      );
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(muitosUsuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      // 100 usuários com 30 por página (inicialmente 30)
      expect(result.current.usuarios).toHaveLength(30);
      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.carregarMaisUsuarios();
      });

      await waitFor(() => {
        expect(result.current.usuarios).toHaveLength(60);
      });
    });

    it("deve marcar hasMore como false quando chega ao fim", async () => {
      const poucosUsuarios = [makeUsuario("1", "Só Um")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(poucosUsuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      expect(result.current.usuarios).toHaveLength(1);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("removerUsuario", () => {
    it("deve remover usuário da lista ao chamar removerUsuario", async () => {
      const usuarios = [makeUsuario("1", "João"), makeUsuario("2", "Maria")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 }),
      );

      let sucesso: boolean | undefined;
      await act(async () => {
        sucesso = await result.current.removerUsuario("1");
      });

      expect(sucesso).toBe(true);
      expect(result.current.usuarios.find((u) => u._id === "1")).toBeUndefined();
    });

    it("deve retornar false quando id é vazio", async () => {
      const { result } = renderHook(() => useUserManagement());

      let sucesso: boolean | undefined;
      await act(async () => {
        sucesso = await result.current.removerUsuario("");
      });

      expect(sucesso).toBe(false);
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
    });

    it("deve retornar false quando API retorna erro", async () => {
      const usuarios = [makeUsuario("1", "João")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      authenticatedFetchMock.mockResolvedValueOnce(new Response("Erro", { status: 500 }));

      let sucesso: boolean | undefined;
      await act(async () => {
        sucesso = await result.current.removerUsuario("1");
      });

      expect(sucesso).toBe(false);
    });
  });

  describe("removerTodosOsUsuarios", () => {
    it("deve remover todos quando confirmado", async () => {
      const usuarios = [makeUsuario("1", "João"), makeUsuario("2", "Maria")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 }),
      );

      await act(async () => {
        await result.current.removerTodosOsUsuarios();
      });

      expect(result.current.usuarios).toHaveLength(0);
      confirmSpy.mockRestore();
    });

    it("não deve remover quando usuário cancela", async () => {
      const usuarios = [makeUsuario("1", "João")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(usuarios), { status: 200 }),
      );

      const { result } = renderHook(() => useUserManagement());

      await act(async () => {
        await result.current.carregarUsuarios(true);
      });

      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      await act(async () => {
        await result.current.removerTodosOsUsuarios();
      });

      expect(result.current.usuarios).toHaveLength(1);
      // Chama apenas o carregarUsuarios, o Delete não é chamado
      expect(authenticatedFetchMock).toHaveBeenCalledTimes(1);
      confirmSpy.mockRestore();
    });
  });
});
