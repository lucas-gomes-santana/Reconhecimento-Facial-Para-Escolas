import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "../../../../src/hooks/auth/useAuth";
import type { AdminData } from "../../../../src/types/admin.types";
import type { LoginResponse } from "../../../../src/types/login.types";
import { baseURL } from "../../../../src/config/url";

const mockAdmin: AdminData = {
  _id: "abc123",
  nome: "admin",
  funcao: "admin",
  dataCadastro: "2026-01-01T00:00:00.000Z",
};

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const defaultNotAuth = () => jsonResponse({}, 401);

describe("useAuth", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    global.fetch = vi.fn();
    fetchMock = vi.mocked(global.fetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Monta o hook, deixa o efeito de verifyToken no mount terminar e zera o histórico de fetch
  const mountAuth = async () => {
    fetchMock.mockResolvedValue(defaultNotAuth());
    const utils = renderHook(() => useAuth());
    await waitFor(() => {
      expect(utils.result.current.loading).toBe(false);
    });
    fetchMock.mockReset();
    return utils;
  };

  describe("login", () => {
    it("deve retornar sucesso e salvar dados do admin ao logar", async () => {
      const { result } = await mountAuth();
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, admin: mockAdmin }));

      await act(async () => {
        const response: LoginResponse = await result.current.login("admin", "12345678");
        expect(response.success).toBe(true);
        expect(response.message).toBe("Login realizado com sucesso");
        expect(response.admin).toEqual(mockAdmin);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.admin).toEqual(mockAdmin);
      expect(fetchMock.mock.calls[0][0]).toBe(`${baseURL}/admin/login`);
    });

    it("deve retornar falha quando o servidor retorna erro", async () => {
      const { result } = await mountAuth();
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ success: false, message: "Senha incorreta" }, 401),
      );

      await act(async () => {
        const response: LoginResponse = await result.current.login("admin", "errada");
        expect(response.success).toBe(false);
        expect(response.message).toBe("Senha incorreta");
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("deve retornar erro de conexão quando fetch falha", async () => {
      const { result } = await mountAuth();
      fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await act(async () => {
        const response: LoginResponse = await result.current.login("admin", "12345678");
        expect(response.success).toBe(false);
        expect(response.message).toBe("Erro de conexão com o servidor");
      });
    });

    it("deve enviar credenciais no corpo da requisição", async () => {
      const { result } = await mountAuth();
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, admin: mockAdmin }));

      await act(async () => {
        await result.current.login("admin", "12345678");
      });

      const requestInit = fetchMock.mock.calls[0][1];
      expect(requestInit?.method).toBe("POST");
      const body = JSON.parse(String(requestInit?.body));
      expect(body).toEqual({ nome: "admin", senha: "12345678" });
    });
  });

  describe("logout", () => {
    it("deve limpar estado e chamar endpoint de logout", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true, admin: mockAdmin }));
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // reset e simular o logout
      fetchMock.mockReset();
      fetchMock.mockResolvedValue(jsonResponse({}));
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.admin).toBeNull();
    });
  });

  describe("verifyToken", () => {
    it("deve autenticar quando token válido", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true, admin: mockAdmin }));
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.admin).toEqual(mockAdmin);
    });

    it("deve renovar token e reautenticar quando 401", async () => {
      // usa mockResolvedValueOnce para o mount + refresh + retry
      fetchMock
        .mockResolvedValueOnce(jsonResponse({}, 401))
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(jsonResponse({ success: true, admin: mockAdmin }));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("deve limpar estado quando token inválido e refresh falha", async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({}, 401))
        .mockResolvedValueOnce(new Response(null, { status: 401 }));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.admin).toBeNull();
    });
  });

  describe("authenticatedFetch", () => {
    it("deve retornar resposta direta para status ok", async () => {
      const { result } = await mountAuth();
      fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

      let response: Response | undefined;
      await act(async () => {
        response = await result.current.authenticatedFetch(`${baseURL}/usuarios/listar`);
      });

      expect(response?.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("deve renovar token e repetir requisição em 401", async () => {
      const { result } = await mountAuth();
      fetchMock
        .mockResolvedValueOnce(jsonResponse({}, 401))
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(jsonResponse({ dados: true }));

      let response: Response | undefined;
      await act(async () => {
        response = await result.current.authenticatedFetch(`${baseURL}/usuarios/listar`);
      });

      const body = await response?.json();
      expect(body).toEqual({ dados: true });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("deve lançar erro de sessão expirada quando 401 após renovar", async () => {
      const { result } = await mountAuth();
      fetchMock
        .mockResolvedValueOnce(jsonResponse({}, 401))
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(jsonResponse({}, 401));

      await act(async () => {
        await expect(
          result.current.authenticatedFetch(`${baseURL}/usuarios/listar`),
        ).rejects.toThrow("Sessão expirada. Faça login novamente.");
      });
    });
  });

  describe("funções de role", () => {
    it("isAdmin deve retornar true apenas para funcao admin", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true, admin: mockAdmin }));
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin()).toBe(true);
      expect(result.current.isSeguranca()).toBe(false);
      expect(result.current.isSuperAdmin()).toBe(false);
      expect(result.current.isDesenvolvedor()).toBe(false);
    });

    it("verifica roles com admin desenvolvedor", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          success: true,
          admin: { ...mockAdmin, funcao: "desenvolvedor" },
        }),
      );
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isDesenvolvedor()).toBe(true);
      expect(result.current.isAdmin()).toBe(false);
    });
  });
});
