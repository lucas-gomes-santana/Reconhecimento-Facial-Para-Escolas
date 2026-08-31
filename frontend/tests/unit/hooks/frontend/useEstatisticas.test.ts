import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEstatisticas } from "../../../../src/hooks/frontend/useEstatisticas";
import { useAuth } from "../../../../src/hooks/auth/useAuth";
import { useApi } from "../../../../src/hooks/api/useApi";
import type { EstatisticasBasicas } from "../../../../src/types/estatisticas.types";
import { baseURL } from "../../../../src/config/url";

vi.mock("../../../../src/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../../src/hooks/api/useApi", () => ({
  useApi: vi.fn(),
}));

const mockAuth = vi.mocked(useAuth);
const mockUseApi = vi.mocked(useApi);

const estatisticasBasicas: EstatisticasBasicas = {
  totalCadastros: 10,
  totalVerificacoes: 50,
  ultimaAtualizacao: "2026-01-01T00:00:00.000Z",
};

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("useEstatisticas", () => {
  const authenticatedFetchMock = vi.fn();
  const handleApiErrorMock = vi.fn((e: unknown) =>
    e instanceof Error ? e : new Error("transferido"),
  );

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
    authenticatedFetchMock.mockReset();

    mockAuth.mockReturnValue({
      authenticatedFetch: authenticatedFetchMock,
    } as unknown as ReturnType<typeof useAuth>);

    mockUseApi.mockReturnValue({
      handleApiError: handleApiErrorMock,
    } as unknown as ReturnType<typeof useApi>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("carregarEstatisticas", () => {
    it("deve carregar estatísticas básicas do endpoint correto", async () => {
      const fetchMock = vi.mocked(global.fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, dados: estatisticasBasicas }));

      const { result } = renderHook(() => useEstatisticas());

      await act(async () => {
        await result.current.carregarEstatisticas(false);
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${baseURL}/estatisticas`,
        expect.objectContaining({ method: "GET" }),
      );
      expect(result.current.estatisticas).toEqual(estatisticasBasicas);
      expect(result.current.mostrandoDetalhes).toBe(false);
    });

    it("deve usar endpoint detalhadas quando true", async () => {
      const fetchMock = vi.mocked(global.fetch);
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ success: true, dados: { ...estatisticasBasicas, usuariosPorTipo: [] } }),
      );

      const { result } = renderHook(() => useEstatisticas());

      await act(async () => {
        await result.current.carregarEstatisticas(true);
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${baseURL}/estatisticas/detalhadas`,
        expect.anything(),
      );
      expect(result.current.mostrandoDetalhes).toBe(true);
    });

    it("deve definir erro quando a resposta não é ok", async () => {
      const fetchMock = vi.mocked(global.fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Servidor com erro" }, 500));

      const { result } = renderHook(() => useEstatisticas());

      await act(async () => {
        await expect(result.current.carregarEstatisticas(false)).rejects.toThrow(
          "Servidor com erro",
        );
      });

      expect(result.current.error).toBe("Servidor com erro");
    });
  });

  describe("obterEstatisticas", () => {
    it("deve retornar dados de estatísticas", async () => {
      const fetchMock = vi.mocked(global.fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse(estatisticasBasicas));

      const { result } = renderHook(() => useEstatisticas());

      let data: EstatisticasBasicas | undefined;
      await act(async () => {
        data = await result.current.obterEstatisticas();
      });

      expect(data).toEqual(estatisticasBasicas);
      expect(result.current.error).toBeNull();
    });
  });

  describe("obterEstatisticasDetalhadas", () => {
    it("deve retornar estatísticas detalhadas", async () => {
      const fetchMock = vi.mocked(global.fetch);
      const detalhadas = { ...estatisticasBasicas, usuariosPorTipo: [] };
      fetchMock.mockResolvedValueOnce(jsonResponse(detalhadas));

      const { result } = renderHook(() => useEstatisticas());

      let data: unknown;
      await act(async () => {
        data = await result.current.obterEstatisticasDetalhadas();
      });

      expect(data).toEqual(detalhadas);
    });
  });

  describe("resetarEstatisticas", () => {
    it("deve chamar endpoint de reset via authenticatedFetch", async () => {
      const fetchMock = vi.mocked(global.fetch);
      // reset usa authenticatedFetch
      authenticatedFetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));
      // após reset chama carregarEstatisticas
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, dados: estatisticasBasicas }));

      const { result } = renderHook(() => useEstatisticas());

      await act(async () => {
        await result.current.resetarEstatisticas();
      });

      expect(authenticatedFetchMock).toHaveBeenCalledWith(
        `${baseURL}/estatisticas/reset`,
        expect.objectContaining({ method: "POST" }),
      );
      expect(result.current.estatisticas).toEqual(estatisticasBasicas);
    });
  });

  describe("toggleDetalhes", () => {
    it("deve alternar entre detalhes e básico", async () => {
      const fetchMock = vi.mocked(global.fetch);
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ success: true, dados: { ...estatisticasBasicas, usuariosPorTipo: [] } }),
      );

      const { result } = renderHook(() => useEstatisticas());

      await act(async () => {
        await result.current.toggleDetalhes();
      });

      expect(result.current.mostrandoDetalhes).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseURL}/estatisticas/detalhadas`,
        expect.anything(),
      );
    });
  });

  describe("clearError", () => {
    it("deve limpar o erro", async () => {
      const fetchMock = vi.mocked(global.fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Só um erro" }, 500));

      const { result } = renderHook(() => useEstatisticas());

      await act(async () => {
        await result.current.carregarEstatisticas(false).catch(() => {});
      });

      expect(result.current.error).toBe("Só um erro");

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
