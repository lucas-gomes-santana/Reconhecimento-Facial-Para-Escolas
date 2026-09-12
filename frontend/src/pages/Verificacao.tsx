import { useEffect } from "react";
import { Camera, CheckCircle, XCircle } from "lucide-react";
import { useApi } from "../hooks/api/useApi";
import { useFaceDetection } from "../hooks/detection/useFaceDetection";
import { useValidation } from "../hooks/validation/useValidation";
import { useVerificacao } from "../hooks/auth/useVerificacao";
import VideoCanvasDetector from "../components/VideoAndCanvas";
import "../styles/index.css";

function Verificacao() {
  const { loading: apiLoading, error: apiError } = useApi();

  const { loading: faceLoading, error: faceError, expressionStatus } = useFaceDetection();

  const { getDistanceMessage } = useValidation();

  const {
    verificacaoCompleta,
    resultadoVerificacao,
    realizarVerificacao,
    reiniciarProcesso,
    pararSistema,
    iniciarSistema,
    isInitialized,
    videoRef,
    canvasRef,
    distanceStatus,
    isAtIdealDistance,
    isDetecting,
  } = useVerificacao();

  useEffect(() => {
    if (apiError) {
      alert(`Erro: ${apiError}`);
    } else if (faceError) {
      alert(`Erro: ${faceError}`);
    }
  }, [apiError, faceError]);

  const renderBotaoAcao = () => {
    if (!isInitialized) {
      return (
        <button
          onClick={iniciarSistema}
          disabled={faceLoading}
          className="cerf-btn-success w-full flex items-center justify-center gap-2 px-6 py-3"
        >
          <Camera className="w-5 h-5" />
          {faceLoading ? "Carregando..." : "Iniciar Verificação"}
        </button>
      );
    }

    if (verificacaoCompleta) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={reiniciarProcesso}
            className="cerf-btn-success flex-1 flex items-center justify-center gap-2 px-6 py-3"
          >
            <Camera className="w-5 h-5" />
            Nova Verificação
          </button>
          <button
            onClick={pararSistema}
            className="cerf-btn-danger flex-1 flex items-center justify-center gap-2 px-6 py-3"
          >
            Finalizar
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={realizarVerificacao}
          disabled={!isAtIdealDistance || apiLoading}
          className="cerf-btn-success flex-1 flex items-center justify-center gap-2 px-6 py-3"
        >
          <CheckCircle className="w-5 h-5" />
          {apiLoading ? "Verificando..." : "Verificar Identidade"}
        </button>
        <button
          onClick={pararSistema}
          className="cerf-btn-danger flex-1 flex items-center justify-center gap-2 px-6 py-3"
        >
          Cancelar
        </button>
      </div>
    );
  };

  return (
    <div className="cerf-scan-bg min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl cerf-surface">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="cerf-heading text-center text-2xl flex items-center justify-center gap-2">
            <Camera className="w-6 h-6 cerf-accent-text" />
            Verificação de Cadastro
          </h1>
        </div>

        {/* Conteúdo */}
        <div className="px-6 pb-6 space-y-6">
          {/* Video Canvas Detector */}
          <VideoCanvasDetector
            videoRef={videoRef}
            canvasRef={canvasRef}
            isDetecting={isDetecting}
            distanceStatus={distanceStatus}
            expressionStatus={expressionStatus}
            getDistanceMessage={getDistanceMessage}
          />

          {/* Mensagens de Erro */}
          {(apiError || faceError) && (
            <div className="cerf-alert-error p-4 flex items-start gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 cerf-alert-error-text" />
              <span className="text-sm cerf-alert-error-text">{apiError || faceError}</span>
            </div>
          )}

          {/* Resultado da Verificação */}
          {verificacaoCompleta && resultadoVerificacao && (
            <div
              className={`p-6 ${
                resultadoVerificacao.existe ? "cerf-result-success" : "cerf-result-danger"
              }`}
            >
              {resultadoVerificacao.existe ? (
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-8 h-8 text-white" />
                    <h3 className="font-bold text-lg text-white">
                      Rosto encontrado. Acesso autorizado!
                    </h3>
                  </div>
                  {resultadoVerificacao.dados?.usuario?.nome && (
                    <p className="text-lg font-medium text-white">
                      Bem-vindo(a),{" "}
                      <span className="font-bold">{resultadoVerificacao.dados.usuario.nome}</span>!
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="w-8 h-8 text-white" />
                    <h3 className="font-bold text-lg text-white">
                      Rosto não encontrado. Acesso negado!
                    </h3>
                  </div>
                </div>
              )}
            </div>
          )}

          {renderBotaoAcao()}
        </div>
      </div>
    </div>
  );
}

export default Verificacao;
