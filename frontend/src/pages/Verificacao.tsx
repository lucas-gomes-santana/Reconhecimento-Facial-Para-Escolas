import { useEffect} from 'react';
import { useApi } from '../hooks/api/useApi';
import { useFaceDetection } from '../hooks/detection/useFaceDetection';
import { useValidation } from '../hooks/validation/useValidation';
import { useVerificacao } from '../hooks/auth/useVerificacao';
import VideoCanvasDetector from '../components/VideoAndCanvas';
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
          className="bg-blue-500 text-white border-none py-3 px-5 rounded cursor-pointer text-base mt-8 w-full max-w-xs mx-auto transition-colors duration-300 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {faceLoading ? 'Carregando...' : 'Iniciar Verificação'}
        </button>
      );
    }

    if (verificacaoCompleta) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button 
            onClick={reiniciarProcesso}
            className="bg-green-500 text-white border-none py-3 px-5 rounded cursor-pointer text-base transition-colors duration-300 hover:bg-green-600"
          >
            Nova Verificação
          </button>
          <button 
            onClick={pararSistema}
            className="bg-red-500 text-white border-none py-3 px-5 rounded cursor-pointer text-base transition-colors duration-300 hover:bg-red-600"
          >
            Finalizar
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
        <button 
          onClick={realizarVerificacao}
          disabled={!isAtIdealDistance || apiLoading}
          className="bg-green-500 text-white border-none py-3 px-5 rounded cursor-pointer text-base transition-colors duration-300 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {apiLoading ? 'Verificando...' : 'Verificar Identidade'}
        </button>
        <button 
          onClick={pararSistema}
          className="bg-red-500 text-white border-none py-3 px-5 rounded cursor-pointer text-base transition-colors duration-300 hover:bg-red-600"
        >
          Cancelar
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-200 py-8 px-6 flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-4xl text-center mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          🔍 Verificação de Cadastro
        </h1>
        
        <VideoCanvasDetector
          videoRef={videoRef}
          canvasRef={canvasRef}
          isDetecting={isDetecting}
          distanceStatus={distanceStatus}
          getDistanceMessage={getDistanceMessage}
        />
        
        {(apiError || faceError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {apiError || faceError}
          </div>
        )}

        {verificacaoCompleta && resultadoVerificacao && (
          <div className={`mb-4 p-4 rounded-lg ${
            resultadoVerificacao.existe 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {resultadoVerificacao.existe ? (
              <div className='mt-6'>
                <h3 className="font-bold text-lg mb-2">✅ Rosto encontrado. Acesso autorizado!</h3>
                {resultadoVerificacao.dados?.usuario?.nome && (
                  <p className="text-lg font-medium">
                    Bem-vindo(a), <span className="font-bold">{resultadoVerificacao.dados.usuario.nome}</span>!
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-lg mb-2">❌Rosto não encontrado. Acesso negado!</h3>
              </div>
            )}
          </div>
        )}
        
        {renderBotaoAcao()}
      </div>
    </div>
  );
}

export default Verificacao;