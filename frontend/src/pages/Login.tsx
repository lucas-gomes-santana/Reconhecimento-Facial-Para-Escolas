import { ScanFace, EyeOff, Eye, AlertCircle, Loader } from "lucide-react";
import { useLogin } from "../hooks/frontend/useLogin";
import "../styles/index.css";

function Login() {
  const {
    nome,
    setNome,
    senha,
    setSenha,
    mostrarSenha,
    error,
    setError,
    loading,
    handleLogin,
    toggleMostrarSenha,
  } = useLogin();

  return (
    <>
      <main className="cerf-scan-bg flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="cerf-surface p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="cerf-icon-badge w-16 h-16">
                  <ScanFace className="w-10 h-10" />
                </div>
              </div>
              <h1 className="cerf-heading text-3xl mb-2">Sistema C.E.R.F</h1>
              <p className="cerf-subtext">Acesse sua conta para continuar</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="cerf-label block mb-2">Usuário</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    setError("");
                  }}
                  className="cerf-input px-4 py-3"
                  placeholder="Digite seu nome de usuário"
                />
              </div>

              <div>
                <label className="cerf-label block mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setError("");
                    }}
                    className="cerf-input px-4 py-3 pr-12"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={toggleMostrarSenha}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center
                                                    text-gray-400 hover:cerf-accent-text transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="cerf-alert-error p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="cerf-alert-error-text text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="cerf-btn-primary w-full py-3 px-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    Validando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
export default Login;
