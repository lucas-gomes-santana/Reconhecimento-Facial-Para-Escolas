import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVerificacao } from "../../../../src/hooks/auth/useVerificacao";
import { useApi } from "../../../../src/hooks/api/useApi";
import { useFaceDetection } from "../../../../src/hooks/detection/useFaceDetection";
import { useValidation } from "../../../../src/hooks/validation/useValidation";
import { useAuth } from "../../../../src/hooks/auth/useAuth";
import { baseURL } from "../../../../src/config/url";

vi.mock("../../../../src/hooks/api/useApi", () => ({
  useApi: vi.fn(),
}));

vi.mock("../../../../src/hooks/detection/useFaceDetection", () => ({
  useFaceDetection: vi.fn(),
}));

vi.mock("../../../../src/hooks/validation/useValidation", () => ({
  useValidation: vi.fn(),
}));

vi.mock("../../../../src/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockUseApi = vi.mocked(useApi);
const mockFaceDetection = vi.mocked(useFaceDetection);
const mockValidation = vi.mocked(useValidation);
const mockAuth = vi.mocked(useAuth);

const descriptor = new Array(128).fill(0.5);

describe("useVerificacao", () => {
  const authenticatedFetchMock = vi.fn();
  const setLoading = vi.fn();
  const setError = vi.fn();
  const clearError = vi.fn();
  const handleApiErrorMock = vi.fn((e: unknown) =>
    e instanceof Error ? e : new Error("erro genérico"),
  );
  const validateDescriptorMock = vi.fn();
  const showValidationErrors = vi.fn();

  const defaultFaceDetection = () => ({
    isDetecting: false,
    currentDescriptor: descriptor,
    isAtIdealDistance: true,
    error: null,
    startDetection: vi.fn().mockResolvedValue(undefined),
    stopDetection: vi.fn(),
    aguardarDescriptor: vi.fn().mockResolvedValue(descriptor),
    videoRef: { current: null },
    canvasRef: { current: null },
    distanceStatus: { status: "ideal", isIdeal: true },
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    authenticatedFetchMock.mockReset();
    setLoading.mockReset();
    setError.mockReset();
    clearError.mockReset();
    validateDescriptorMock.mockReset();
    showValidationErrors.mockReset();

    mockUseApi.mockReturnValue({
      clearError,
      error: null,
      setError,
      setLoading,
      handleApiError: handleApiErrorMock,
    } as unknown as ReturnType<typeof useApi>);

    mockFaceDetection.mockReturnValue(
      defaultFaceDetection() as unknown as ReturnType<typeof useFaceDetection>,
    );

    mockValidation.mockReturnValue({
      validateDescriptor: validateDescriptorMock,
      showValidationErrors,
    } as unknown as ReturnType<typeof useValidation>);

    mockAuth.mockReturnValue({
      authenticatedFetch: authenticatedFetchMock,
    } as unknown as ReturnType<typeof useAuth>);
  });

  describe("verificarRosto", () => {
    it("deve mapear resposta quando usuário é encontrado", async () => {
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            encontrado: true,
            usuario: {
              id: "123",
              nome: "João",
              tipoUsuario: "Aluno",
              dataCadastro: "2026-01-01",
              status: "liberado",
            },
            similaridade: 0.98,
            distancia: 0.5,
          }),
          { status: 200 },
        ),
      );

      const { result } = renderHook(() => useVerificacao());

      let resp: Awaited<ReturnType<typeof result.current.verificarRosto>> | undefined;
      await act(async () => {
        resp = await result.current.verificarRosto(descriptor, "verificacao");
      });

      expect(resp?.existe).toBe(true);
      expect(resp?.dados?.usuario.nome).toBe("João");
      expect(resp?.dados?.usuario.tipoUsuario).toBe("Aluno");
      expect(resp?.dados?.similaridade).toBe(0.98);
      expect(resp?.dados?.distancia).toBe(0.5);

      const call = authenticatedFetchMock.mock.calls[0];
      expect(call[0]).toBe(`${baseURL}/verificar-rosto`);
      const body = JSON.parse(String(call[1].body));
      expect(body).toEqual({ descriptor, contexto: "verificacao" });
    });

    it("deve mapear existe false quando não encontrado", async () => {
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ encontrado: false }), { status: 200 }),
      );

      const { result } = renderHook(() => useVerificacao());

      let resp: Awaited<ReturnType<typeof result.current.verificarRosto>> | undefined;
      await act(async () => {
        resp = await result.current.verificarRosto(descriptor, "verificacao");
      });

      expect(resp?.existe).toBe(false);
      expect(resp?.dados).toBeNull();
    });

    it("deve lançar erro quando resposta não é ok", async () => {
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Rosto não cadastrado" }), { status: 400 }),
      );

      const { result } = renderHook(() => useVerificacao());

      await act(async () => {
        await expect(result.current.verificarRosto(descriptor, "verificacao")).rejects.toThrow(
          "Rosto não cadastrado",
        );
      });

      expect(setError).toHaveBeenCalled();
    });

    it("deve lançar erro quando resposta não é JSON válido", async () => {
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response("<html>erro</html>", { status: 500 }),
      );

      const { result } = renderHook(() => useVerificacao());

      await act(async () => {
        await expect(result.current.verificarRosto(descriptor, "verificacao")).rejects.toThrow(
          /Resposta inválida|erro genérico/,
        );
      });
    });
  });

  describe("realizarVerificacao", () => {
    it("deve avisar quando não está na distância ideal", async () => {
      mockFaceDetection.mockReturnValue({
        ...defaultFaceDetection(),
        isAtIdealDistance: false,
      } as unknown as ReturnType<typeof useFaceDetection>);

      const { result } = renderHook(() => useVerificacao());

      await act(async () => {
        await result.current.realizarVerificacao();
      });

      expect(showValidationErrors).toHaveBeenCalled();
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
      expect(result.current.verificacaoCompleta).toBe(false);
    });

    it("deve evitar verificação quando validação do descriptor falha", async () => {
      validateDescriptorMock.mockReturnValue({ isValid: false, errors: ["erro"] });

      const { result } = renderHook(() => useVerificacao());

      await act(async () => {
        await result.current.realizarVerificacao();
      });

      expect(showValidationErrors).toHaveBeenCalledWith(["erro"]);
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
    });

    it("deve executar verificação com sucesso e definir resultado", async () => {
      validateDescriptorMock.mockReturnValue({ isValid: true, errors: [] });
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            encontrado: true,
            usuario: { id: "1", nome: "Maria", tipoUsuario: "Professor" },
            similaridade: 0.95,
          }),
          { status: 200 },
        ),
      );

      const { result } = renderHook(() => useVerificacao());

      await act(async () => {
        await result.current.realizarVerificacao();
      });

      expect(result.current.verificacaoCompleta).toBe(true);
      expect(result.current.resultadoVerificacao?.existe).toBe(true);
      expect(result.current.resultadoVerificacao?.dados?.usuario.nome).toBe("Maria");
      expect(authenticatedFetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("reiniciarProcesso e pararSistema", () => {
    it("reiniciarProcesso deve limpar resultado e completude", () => {
      const { result } = renderHook(() => useVerificacao());

      act(() => {
        result.current.reiniciarProcesso();
      });

      expect(result.current.verificacaoCompleta).toBe(false);
      expect(result.current.resultadoVerificacao).toBeNull();
    });

    it("pararSistema deve chamar stopDetection e limpar estado", () => {
      const stopDetection = vi.fn();
      mockFaceDetection.mockReturnValue({
        ...defaultFaceDetection(),
        stopDetection,
      } as unknown as ReturnType<typeof useFaceDetection>);

      const { result } = renderHook(() => useVerificacao());

      act(() => {
        result.current.pararSistema();
      });

      expect(stopDetection).toHaveBeenCalled();
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.verificacaoCompleta).toBe(false);
    });
  });
});
