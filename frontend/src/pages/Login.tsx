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
      <main className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 bg-[#1E3A8A] rounded-xl flex items-center justify-center">
                  <ScanFace className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Sistema C.E.R.F</h1>
              <p className="text-gray-600">Acesse sua conta para continuar</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Usuário</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    setError("");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                                            focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]
                                            transition-all"
                  placeholder="Digite seu nome de usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1E3A8A] mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                                                focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]
                                                transition-all pr-12"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={toggleMostrarSenha}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center 
                                                    text-gray-400 hover:text-[#1E3A8A] transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 px-4 text-white font-semibold rounded-lg 
                                        bg-[#6A1B9A] hover:bg-[#4A148C] focus:outline-none 
                                        focus:ring-2 focus:ring-[#6A1B9A] focus:ring-offset-2 transition-all
                                        disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg
                                        hover:shadow-xl"
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
