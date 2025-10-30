import { useEffect } from 'react';
import { useApi } from '../hooks/api/useApi';
import { useFaceDetection } from '../hooks/detection/useFaceDetection';
import { useValidation } from '../hooks/validation/useValidation';
import { useVerificacao } from '../hooks/auth/useVerificacao';
import VideoCanvasDetector from '../components/VideoAndCanvas';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import '../styles/index.css';

function Verificacao() {
  const { 
    loading: apiLoading, 
    error: apiError, 
  } = useApi();

  const {
    loading: faceLoading,
    error: faceError,
  } = useFaceDetection();
  
  const { 
    getDistanceMessage, 
  } = useValidation();

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
      console.log(`Erro: ${apiError}`);
    } else if (faceError) {
      console.log(`Erro: ${faceError}`);
    }
  }, [apiError, faceError]);

  // Determinar qual botão mostrar
  const renderBotaoAcao = () => {
    if (!isInitialized) {
      return (
        <button 
          onClick={iniciarSistema}
          disabled={faceLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-5 h-5" />
          {faceLoading ? 'Carregando...' : 'Iniciar Verificação'}
        </button>
      );
    }

    if (verificacaoCompleta) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button 
            onClick={reiniciarProcesso}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            <Camera className="w-5 h-5" />
            Nova Verificação
          </button>
          <button 
            onClick={pararSistema}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors"
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
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          {apiLoading ? 'Verificando...' : 'Verificar Identidade'}
        </button>
        <button 
          onClick={pararSistema}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#E8F534]">
      <div className="w-full max-w-xl bg-white border-none shadow-xl rounded-lg">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-center text-2xl font-semibold text-[#3F51B5] flex items-center justify-center gap-2">
            <Camera className="w-6 h-6" />
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
            getDistanceMessage={getDistanceMessage}
          />
          
          {/* Mensagens de Erro */}
          {(apiError || faceError) && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{apiError || faceError}</span>
            </div>
          )}

          {/* Resultado da Verificação */}
          {verificacaoCompleta && resultadoVerificacao && (
            <div className={`p-6 rounded-lg ${
              resultadoVerificacao.existe 
                ? 'bg-[#00E676]/90 border-2 border-[#00E676]' 
                : 'bg-red-500/90 border-2 border-red-500'
            }`}>
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
                      Bem-vindo(a), <span className="font-bold">{resultadoVerificacao.dados.usuario.nome}</span>!
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
          
          {/* Botões de Ação */}
          {renderBotaoAcao()}
        </div>
      </div>
    </div>
  );
}

export default Verificacao;