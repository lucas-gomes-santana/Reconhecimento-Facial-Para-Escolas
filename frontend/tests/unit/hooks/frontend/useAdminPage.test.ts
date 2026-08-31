import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAdminPage } from "../../../../src/hooks/frontend/useAdminPage";
import { useAuth } from "../../../../src/hooks/auth/useAuth";
import type { AdminData } from "../../../../src/types/admin.types";

vi.mock("../../../../src/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockAuth = vi.mocked(useAuth);

const makeAdmin = (id: string, nome: string, funcao: AdminData["funcao"] = "admin"): AdminData => ({
  _id: id,
  nome,
  funcao,
  dataCadastro: "2026-01-01T00:00:00.000Z",
});

describe("useAdminPage", () => {
  const authenticatedFetchMock = vi.fn();
  const mockAuthState = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => ({
    authenticatedFetch: authenticatedFetchMock,
    isAdmin: vi.fn(() => true),
    isDesenvolvedor: vi.fn(() => false),
    isSuperAdmin: vi.fn(() => false),
    admin: null,
    ...overrides,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    authenticatedFetchMock.mockReset();
    mockAuth.mockReturnValue(mockAuthState() as unknown as ReturnType<typeof useAuth>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("listagem de admins", () => {
    it("deve carregar e listar administradores", async () => {
      const admins = [makeAdmin("1", "João", "admin"), makeAdmin("2", "Maria", "seguranca")];

      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(admins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      expect(result.current.todosAdmins).toHaveLength(2);
      expect(result.current.todosAdmins[0].nome).toBe("João");
    });

    it("deve mapear dataCadastro quando createdAt está presente", async () => {
      const admins = [
        { _id: "1", nome: "João", funcao: "admin", createdAt: "2026-05-01T00:00:00.000Z" },
      ];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(admins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      expect(result.current.todosAdmins[0].dataCadastro).toBe("2026-05-01T00:00:00.000Z");
    });

    it("deve definir mensagem de erro quando falha a requisição", async () => {
      authenticatedFetchMock.mockRejectedValueOnce(new Error("Servidor fora"));

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      expect(result.current.message.tipo).toBe("error");
      expect(result.current.message.texto).toBe("Erro ao carregar lista de usuários");
    });
  });

  describe("filtro de busca", () => {
    it("deve filtrar admins por nome", async () => {
      const admins = [makeAdmin("1", "João", "admin"), makeAdmin("2", "Maria", "seguranca")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(admins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      act(() => {
        result.current.buscarAdmins("joão");
      });

      await waitFor(() => {
        expect(result.current.admins).toHaveLength(1);
        expect(result.current.admins[0].nome).toBe("João");
      });
    });

    it("deve filtrar admins por função", async () => {
      const admins = [makeAdmin("1", "João", "admin"), makeAdmin("2", "Maria", "seguranca")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(admins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      act(() => {
        result.current.buscarAdmins("seguranca");
      });

      await waitFor(() => {
        expect(result.current.admins).toHaveLength(1);
        expect(result.current.admins[0].nome).toBe("Maria");
      });
    });

    it("deve retornar total de admins filtrados", async () => {
      const admins = [
        makeAdmin("1", "João", "admin"),
        makeAdmin("2", "Maria", "seguranca"),
        makeAdmin("3", "Pedro", "admin"),
      ];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(admins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      act(() => {
        result.current.buscarAdmins("admin");
      });

      // Importante lembrar que está contanto quantos admins tem no array usando as posições, que começa com zero
      await waitFor(() => {
        expect(result.current.getTotalAdmins()).toBe(2);
      });
    });
  });

  describe("paginação", () => {
    it("deve carregar mais admins ao dar scroll", async () => {
      const muitosAdmins = Array.from({ length: 25 }, (_, i) => makeAdmin(String(i), `Admin ${i}`));
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(muitosAdmins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      // 25 admins, 10 por página
      expect(result.current.admins).toHaveLength(10);
      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.carregarMaisAdmins();
      });

      await waitFor(() => {
        expect(result.current.admins).toHaveLength(20);
      });
    });

    it("deve marcar hasMore como false ao chegar ao fim", async () => {
      const poucosAdmins = [makeAdmin("1", "Só Um")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(poucosAdmins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      expect(result.current.admins).toHaveLength(1);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("handleCadastrarAdmin", () => {
    it("deve bloquear cadastro quando não é super-admin nem desenvolvedor", async () => {
      mockAuth.mockReturnValue(
        mockAuthState({
          isSuperAdmin: vi.fn(() => false),
          isDesenvolvedor: vi.fn(() => false),
        }) as unknown as ReturnType<typeof useAuth>,
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        result.current.setNome("Novo");
        result.current.setSenha("12345678");
        result.current.setFuncao("admin");
      });

      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleCadastrarAdmin(event);
      });

      expect(result.current.message.tipo).toBe("error");
      expect(result.current.message.texto).toContain(
        "Apenas o super-admin ou o desenvolvedor podem cadastrar Admins e Seguranças!",
      );
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
    });

    it("deve bloquear cadastro quando função não é informada", async () => {
      mockAuth.mockReturnValue(
        mockAuthState({
          isSuperAdmin: vi.fn(() => true),
          isDesenvolvedor: vi.fn(() => false),
        }) as unknown as ReturnType<typeof useAuth>,
      );

      const { result } = renderHook(() => useAdminPage());

      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleCadastrarAdmin(event);
      });

      expect(result.current.message.tipo).toBe("error");
      expect(result.current.message.texto).toBe("Função é obrigatória");
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
    });

    it("deve cadastrar admin com sucesso quando tem permissão", async () => {
      mockAuth.mockReturnValue(
        mockAuthState({
          isSuperAdmin: vi.fn(() => true),
          isDesenvolvedor: vi.fn(() => false),
        }) as unknown as ReturnType<typeof useAuth>,
      );

      const admins = [makeAdmin("1", "Existente", "admin")];

      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(admins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        result.current.setNome("Novo Admin");
        result.current.setSenha("12345678");
        result.current.setFuncao("admin");
      });

      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleCadastrarAdmin(event);
      });

      expect(result.current.message.tipo).toBe("success");
      expect(result.current.message.texto).toContain("cadastrado com sucesso");
    });

    it("deve definir mensagem de erro quando backend recusa cadastro", async () => {
      mockAuth.mockReturnValue(
        mockAuthState({
          isSuperAdmin: vi.fn(() => true),
          isDesenvolvedor: vi.fn(() => false),
        }) as unknown as ReturnType<typeof useAuth>,
      );

      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, message: "Nome já existe" }), {
          status: 400,
        }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        result.current.setNome("Duplicado");
        result.current.setSenha("12345678");
        result.current.setFuncao("admin");
      });

      const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleCadastrarAdmin(event);
      });

      expect(result.current.message.tipo).toBe("error");
      expect(result.current.message.texto).toBe("Nome já existe");
    });
  });

  describe("removerAdmin", () => {
    it("deve remover admin da lista com sucesso", async () => {
      const admins = [makeAdmin("1", "João", "admin"), makeAdmin("2", "Maria", "seguranca")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(admins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Usuário removido com sucesso!" }), { status: 200 }),
      );

      let sucesso: boolean | undefined;
      await act(async () => {
        sucesso = await result.current.removerAdmin("1");
      });

      expect(sucesso).toBe(true);
      expect(result.current.todosAdmins.find((a) => a._id === "1")).toBeUndefined();
      expect(result.current.message.tipo).toBe("success");
    });

    it("deve retornar false quando id é vazio", async () => {
      const { result } = renderHook(() => useAdminPage());

      let sucesso: boolean | undefined;
      await act(async () => {
        sucesso = await result.current.removerAdmin("");
      });

      expect(sucesso).toBe(false);
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
    });

    it("deve definir mensagem de erro quando API rejeita", async () => {
      const admins = [makeAdmin("1", "João", "admin")];
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(admins), { status: 200 }),
      );

      const { result } = renderHook(() => useAdminPage());

      await act(async () => {
        await result.current.carregarAdmins(true);
      });

      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Não pode remover" }), { status: 403 }),
      );

      let sucesso: boolean | undefined;
      await act(async () => {
        sucesso = await result.current.removerAdmin("1");
      });

      expect(sucesso).toBe(false);
      expect(result.current.message.tipo).toBe("error");
      expect(result.current.message.texto).toBe("Não pode remover");
    });
  });
});
