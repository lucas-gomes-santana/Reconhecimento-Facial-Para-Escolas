import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLogin } from "../../../../src/hooks/frontend/useLogin";
import { useAuth } from "../../../../src/hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";

vi.mock("../../../../src/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

const mockAuth = vi.mocked(useAuth);
const mockNavigate = vi.mocked(useNavigate);

describe("useLogin", () => {
  let navigate: ReturnType<typeof useNavigate>;
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    loginMock.mockReset();
    navigate = vi.fn();
    mockNavigate.mockReturnValue(navigate);
    mockAuth.mockReturnValue({
      login: loginMock,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);
  });

  const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

  it("deve navegar para /menu quando login é bem-sucedido", async () => {
    loginMock.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      result.current.setNome("admin");
      result.current.setSenha("12345678");
    });

    await act(async () => {
      await result.current.handleLogin(event);
    });

    expect(loginMock).toHaveBeenCalledWith("admin", "12345678");
    expect(navigate).toHaveBeenCalledWith("/menu");
    expect(result.current.error).toBe("");
  });

  it("deve definir erro de acesso não autorizado quando login falha", async () => {
    loginMock.mockResolvedValue({ success: false });
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      result.current.setNome("admin");
      result.current.setSenha("errada");
    });

    await act(async () => {
      await result.current.handleLogin(event);
    });

    expect(navigate).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Acesso não autorizado! Verifique o nome e senha.");
  });

  it("deve definir erro inesperado quando login lança exceção", async () => {
    loginMock.mockRejectedValue(new Error("Servidor fora"));
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      result.current.setNome("admin");
      result.current.setSenha("12345678");
    });

    await act(async () => {
      await result.current.handleLogin(event);
    });

    expect(result.current.error).toBe("Erro inesperado. Tente novamente.");
  });

  it("deve limpar erro no início do handleLogin", async () => {
    loginMock.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useLogin());

    // Simula um erro anterior
    await act(async () => {
      result.current.setError("erro anterior");
    });

    await act(async () => {
      await result.current.handleLogin(event);
    });

    expect(result.current.error).toBe("");
  });

  it("deve alternar mostrarSenha ao chamar toggleMostrarSenha", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.mostrarSenha).toBe(false);

    act(() => {
      result.current.toggleMostrarSenha();
    });
    expect(result.current.mostrarSenha).toBe(true);

    act(() => {
      result.current.toggleMostrarSenha();
    });
    expect(result.current.mostrarSenha).toBe(false);
  });
});
