import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCadastroFacial } from "../../../../src/hooks/frontend/useCadastro";
import { useFaceDetection } from "../../../../src/hooks/detection/useFaceDetection";
import { useApi } from "../../../../src/hooks/api/useApi";
import { useValidation } from "../../../../src/hooks/validation/useValidation";
import { useAuth } from "../../../../src/hooks/auth/useAuth";
import { useVerificacao } from "../../../../src/hooks/auth/useVerificacao";

vi.mock("../../../../src/hooks/detection/useFaceDetection", () => ({
  useFaceDetection: vi.fn(),
}));
vi.mock("../../../../src/hooks/api/useApi", () => ({
  useApi: vi.fn(),
}));
vi.mock("../../../../src/hooks/validation/useValidation", () => ({
  useValidation: vi.fn(),
}));
vi.mock("../../../../src/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));
vi.mock("../../../../src/hooks/auth/useVerificacao", () => ({
  useVerificacao: vi.fn(),
}));

const mockFaceDetection = vi.mocked(useFaceDetection);
const mockApi = vi.mocked(useApi);
const mockValidation = vi.mocked(useValidation);
const mockAuth = vi.mocked(useAuth);
const mockVerificacao = vi.mocked(useVerificacao);

const descriptor = new Array(128).fill(0.3);

describe("useCadastroFacial", () => {
  const authenticatedFetchMock = vi.fn();
  const setLoading = vi.fn();
  const setError = vi.fn();
  const clearError = vi.fn();
  const handleApiErrorMock = vi.fn();
  const validateCadastroFormMock = vi.fn();
  const validateDescriptorMock = vi.fn();
  const showValidationErrors = vi.fn();
  const verificarRostoMock = vi.fn();

  const baseFaceDetection = () => ({
    videoRef: { current: null },
    canvasRef: { current: null },
    isDetecting: false,
    currentDescriptor: descriptor,
    isAtIdealDistance: true,
    distanceStatus: { status: "ideal", isIdeal: true },
    loading: false,
    error: null,
    videoReady: true,
    isVideoLoading: false,
    startDetection: vi.fn().mockResolvedValue(undefined),
    stopDetection: vi.fn(),
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    authenticatedFetchMock.mockReset();
    verificarRostoMock.mockReset();
    validateCadastroFormMock.mockReset();
    validateDescriptorMock.mockReset();

    mockFaceDetection.mockReturnValue(
      baseFaceDetection() as unknown as ReturnType<typeof useFaceDetection>,
    );

    mockApi.mockReturnValue({
      loading: false,
      setLoading,
      error: null,
      setError,
      clearError,
      handleApiError: handleApiErrorMock,
    } as unknown as ReturnType<typeof useApi>);

    mockValidation.mockReturnValue({
      validateCadastroForm: validateCadastroFormMock,
      validateDescriptor: validateDescriptorMock,
      getDistanceMessage: vi.fn(() => "distância"),
      showValidationErrors,
    } as unknown as ReturnType<typeof useValidation>);

    mockAuth.mockReturnValue({
      authenticatedFetch: authenticatedFetchMock,
    } as unknown as ReturnType<typeof useAuth>);

    mockVerificacao.mockReturnValue({
      verificarRosto: verificarRostoMock,
    } as unknown as ReturnType<typeof useVerificacao>);
  });

  describe("handleIniciarReconhecimento", () => {
    it("deve validar formulário antes de iniciar câmera", async () => {
      validateCadastroFormMock.mockReturnValue({
        isValid: false,
        errors: ["Nome é obrigatório"],
      });

      const startDetection = vi.fn();
      mockFaceDetection.mockReturnValue({
        ...baseFaceDetection(),
        startDetection,
      } as unknown as ReturnType<typeof useFaceDetection>);

      const { result } = renderHook(() => useCadastroFacial());

      await act(async () => {
        await result.current.handleIniciarReconhecimento();
      });

      expect(showValidationErrors).toHaveBeenCalled();
      expect(startDetection).not.toHaveBeenCalled();
    });

    it("deve iniciar a detecção quando formulário é válido", async () => {
      validateCadastroFormMock.mockReturnValue({ isValid: true, errors: [] });
      const startDetection = vi.fn().mockResolvedValue(undefined);
      mockFaceDetection.mockReturnValue({
        ...baseFaceDetection(),
        startDetection,
      } as unknown as ReturnType<typeof useFaceDetection>);

      const { result } = renderHook(() => useCadastroFacial());

      await act(async () => {
        result.current.setNome("João");
        result.current.setTipoUsuario("Aluno");
      });

      await act(async () => {
        await result.current.handleIniciarReconhecimento();
      });

      expect(startDetection).toHaveBeenCalled();
    });
  });

  describe("handleSalvarCadastro", () => {
    const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    it("deve bloquear quando formulário é inválido", async () => {
      validateCadastroFormMock.mockReturnValue({
        isValid: false,
        errors: ["Tipo de usuário é obrigatório"],
      });

      const { result } = renderHook(() => useCadastroFacial());

      await act(async () => {
        await result.current.handleSalvarCadastro(event);
      });

      expect(showValidationErrors).toHaveBeenCalled();
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
      expect(verificarRostoMock).not.toHaveBeenCalled();
    });

    it("deve bloquear quando descriptor é inválido", async () => {
      validateCadastroFormMock.mockReturnValue({ isValid: true, errors: [] });
      validateDescriptorMock.mockReturnValue({
        isValid: false,
        errors: ["Descriptor não capturado"],
      });

      const { result } = renderHook(() => useCadastroFacial());

      await act(async () => {
        await result.current.handleSalvarCadastro(event);
      });

      expect(showValidationErrors).toHaveBeenCalled();
      expect(verificarRostoMock).not.toHaveBeenCalled();
    });

    it("deve bloquear quando o rosto já está cadastrado", async () => {
      validateCadastroFormMock.mockReturnValue({ isValid: true, errors: [] });
      validateDescriptorMock.mockReturnValue({ isValid: true, errors: [] });
      verificarRostoMock.mockResolvedValue({
        existe: true,
        dados: { usuario: { id: "1", nome: "João", tipoUsuario: "Aluno" } },
      });
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      const { result } = renderHook(() => useCadastroFacial());

      await act(async () => {
        result.current.setNome("João");
        result.current.setTipoUsuario("Aluno");
      });

      await act(async () => {
        await result.current.handleSalvarCadastro(event);
      });

      expect(alertSpy).toHaveBeenCalled();
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it("deve bloquear quando o nome já existe no sistema", async () => {
      validateCadastroFormMock.mockReturnValue({ isValid: true, errors: [] });
      validateDescriptorMock.mockReturnValue({ isValid: true, errors: [] });
      verificarRostoMock.mockResolvedValue({ existe: false, dados: null });
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify([{ nome: "joão", tipoUsuario: "Aluno" }]), { status: 200 }),
      );
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      const { result } = renderHook(() => useCadastroFacial());

      await act(async () => {
        result.current.setNome("João");
        result.current.setTipoUsuario("Aluno");
      });

      await act(async () => {
        await result.current.handleSalvarCadastro(event);
      });

      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it("deve cadastrar usuário com sucesso", async () => {
      validateCadastroFormMock.mockReturnValue({ isValid: true, errors: [] });
      validateDescriptorMock.mockReturnValue({ isValid: true, errors: [] });
      verificarRostoMock.mockResolvedValue({ existe: false, dados: null });
      authenticatedFetchMock
        .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      const { result } = renderHook(() => useCadastroFacial());

      await act(async () => {
        result.current.setNome("Maria");
        result.current.setTipoUsuario("Aluno");
      });

      await act(async () => {
        await result.current.handleSalvarCadastro(event);
      });

      // GET de verificação de nome + POST de cadastro
      expect(authenticatedFetchMock).toHaveBeenCalledTimes(2);
      expect(alertSpy).toHaveBeenCalled();
      expect(result.current.statusMessage).toBe("Cadastro realizado com sucesso!");
      alertSpy.mockRestore();
    });
  });
});
