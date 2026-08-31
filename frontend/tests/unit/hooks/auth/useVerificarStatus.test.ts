import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVerificarStatus } from "../../../../src/hooks/auth/useVerificarStatus";
import { useVerificacao } from "../../../../src/hooks/auth/useVerificacao";
import { useAuth } from "../../../../src/hooks/auth/useAuth";
import { useApi } from "../../../../src/hooks/api/useApi";
import { baseURL } from "../../../../src/config/url";

vi.mock("../../../../src/hooks/auth/useVerificacao", () => ({
  useVerificacao: vi.fn(),
}));
vi.mock("../../../../src/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));
vi.mock("../../../../src/hooks/api/useApi", () => ({
  useApi: vi.fn(),
}));

const mockVerificacao = vi.mocked(useVerificacao);
const mockAuth = vi.mocked(useAuth);
const mockApi = vi.mocked(useApi);

const descriptor = new Array(128).fill(0.5);

describe("useVerificarStatus", () => {
  const authenticatedFetchMock = vi.fn();
  const verificarRostoMock = vi.fn();
  const setLoading = vi.fn();
  const setError = vi.fn();
  const setVerificacaoCompleta = vi.fn();
  const setResultadoVerificacao = vi.fn();
  const aguardarDescriptorMock = vi.fn();
  const isAtIdealDistance = true;

  beforeEach(() => {
    vi.restoreAllMocks();
    authenticatedFetchMock.mockReset();
    verificarRostoMock.mockReset();
    setLoading.mockReset();
    setError.mockReset();
    aguardarDescriptorMock.mockReset();

    mockVerificacao.mockReturnValue({
      verificarRosto: verificarRostoMock,
      setVerificacaoCompleta,
      setResultadoVerificacao,
      aguardarDescriptor: aguardarDescriptorMock,
      isAtIdealDistance,
    } as unknown as ReturnType<typeof useVerificacao>);

    mockAuth.mockReturnValue({
      authenticatedFetch: authenticatedFetchMock,
    } as unknown as ReturnType<typeof useAuth>);

    mockApi.mockReturnValue({
      setLoading,
      setError,
    } as unknown as ReturnType<typeof useApi>);
  });

  describe("verificarEBloquear", () => {
    it("deve retornar não encontrado quando rosto não existe", async () => {
      verificarRostoMock.mockResolvedValue({ existe: false, dados: null });

      const { result } = renderHook(() => useVerificarStatus());

      let resp: Awaited<ReturnType<typeof result.current.verificarEBloquear>> | undefined;
      await act(async () => {
        resp = await result.current.verificarEBloquear(descriptor);
      });

      expect(resp?.sucesso).toBe(false);
      expect(resp?.mensagem).toBe("Usuário não encontrado");
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
    });

    it("deve bloquear usuário quando cliente está bloqueado", async () => {
      verificarRostoMock.mockResolvedValue({
        existe: true,
        bloqueado: true,
        dados: {
          usuario: {
            id: "1",
            nome: "Maria",
            tipoUsuario: "Aluno",
            bloqueadoAte: new Date(Date.now() + 60000).toISOString(),
          },
        },
      });

      const { result } = renderHook(() => useVerificarStatus());

      let resp: Awaited<ReturnType<typeof result.current.verificarEBloquear>> | undefined;
      await act(async () => {
        resp = await result.current.verificarEBloquear(descriptor);
      });

      expect(resp?.sucesso).toBe(false);
      expect(resp?.bloqueado).toBe(true);
      expect(resp?.mensagem).toContain("Você já retirou merenda");
      expect(result.current.status.usuarioBloqueado).toBe(true);
      expect(authenticatedFetchMock).not.toHaveBeenCalled();
    });

    it("deve liberar merenda e bloquear usuário quando não está bloqueado", async () => {
      verificarRostoMock.mockResolvedValue({
        existe: true,
        bloqueado: false,
        dados: { usuario: { id: "1", nome: "Maria", tipoUsuario: "Aluno" } },
      });
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

      const { result } = renderHook(() => useVerificarStatus());

      let resp: Awaited<ReturnType<typeof result.current.verificarEBloquear>> | undefined;
      await act(async () => {
        resp = await result.current.verificarEBloquear(descriptor);
      });

      expect(resp?.sucesso).toBe(true);
      expect(resp?.bloqueado).toBe(false);
      expect(resp?.mensagem).toContain("Merenda liberada");
      expect(authenticatedFetchMock).toHaveBeenCalledWith(
        `${baseURL}/usuarios/bloquear/1`,
        expect.objectContaining({ method: "PATCH" }),
      );
      expect(result.current.status.podeRetirar).toBe(true);
    });
  });

  describe("bloquearUsuario", () => {
    it("deve chamar endpoint de bloqueio e retornar dados", async () => {
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

      const { result } = renderHook(() => useVerificarStatus());

      let resp: unknown;
      await act(async () => {
        resp = await result.current.bloquearUsuario("abc");
      });

      expect(authenticatedFetchMock).toHaveBeenCalledWith(
        `${baseURL}/usuarios/bloquear/abc`,
        expect.objectContaining({ method: "PATCH" }),
      );
      expect(resp).toEqual({ success: true });
      expect(setLoading).toHaveBeenCalledWith(true);
      expect(setLoading).toHaveBeenCalledWith(false);
    });

    it("deve lançar erro quando resposta não é ok", async () => {
      authenticatedFetchMock.mockResolvedValueOnce(new Response("Erro", { status: 500 }));

      const { result } = renderHook(() => useVerificarStatus());

      await act(async () => {
        await expect(result.current.bloquearUsuario("abc")).rejects.toThrow(
          "Erro ao bloquear usuário",
        );
      });

      expect(setError).toHaveBeenCalled();
    });
  });

  describe("realizarVerificacaoMerenda", () => {
    it("não deve verificar quando não está na distância ideal", async () => {
      mockVerificacao.mockReturnValue({
        verificarRosto: verificarRostoMock,
        setVerificacaoCompleta,
        setResultadoVerificacao,
        aguardarDescriptor: aguardarDescriptorMock,
        isAtIdealDistance: false,
      } as unknown as ReturnType<typeof useVerificacao>);

      const { result } = renderHook(() => useVerificarStatus());

      await act(async () => {
        await result.current.realizarVerificacaoMerenda();
      });

      expect(aguardarDescriptorMock).not.toHaveBeenCalled();
      expect(verificarRostoMock).not.toHaveBeenCalled();
    });

    it("deve executar verificação de merenda completa", async () => {
      aguardarDescriptorMock.mockResolvedValue(descriptor);
      verificarRostoMock.mockResolvedValue({
        existe: true,
        bloqueado: false,
        dados: { usuario: { id: "1", nome: "Maria", tipoUsuario: "Aluno" } },
      });
      authenticatedFetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

      const { result } = renderHook(() => useVerificarStatus());

      await act(async () => {
        await result.current.realizarVerificacaoMerenda();
      });

      expect(aguardarDescriptorMock).toHaveBeenCalled();
      expect(verificarRostoMock).toHaveBeenCalled();
      expect(setVerificacaoCompleta).toHaveBeenCalledWith(true);
      expect(setResultadoVerificacao).toHaveBeenCalled();
    });
  });
});
