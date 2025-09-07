import { useEffect, useState } from 'react';
import { useApi } from '../hooks/api/useApi';
import { useFaceDetection } from '../hooks/detection/useFaceDetection';
import { useValidation } from '../hooks/validation/useValidation';
import '../styles/index.css';


function Verificacao() {
  const { 
    verificarRosto, 
    loading: apiLoading, 
    error: apiError, 
    clearError 
  } = useApi();

  const {
    videoRef,
    canvasRef,
    isDetecting,
    currentDescriptor,
    isAtIdealDistance,
    distanceStatus,
    loading: faceLoading,
    error: faceError,
    startDetection,
    stopDetection,
    aguardarDescriptor
  } = useFaceDetection();
  
  const { 
    validateDescriptor, 
    getDistanceMessage, 
    showValidationErrors 
  } = useValidation();

  const [isInitialized, setIsInitialized] = useState(false);
  const [verificacaoCompleta, setVerificacaoCompleta] = useState(false);
  const [resultadoVerificacao, setResultadoVerificacao] = useState<any>(null);

  // Efeito para limpar erros quando necessário
  useEffect(() => {
    if (apiError) {
      console.log(`Erro: ${apiError}`);
    } else if (faceError) {
      console.log(`Erro: ${faceError}`);
    }
  }, [apiError, faceError]);

  const iniciarSistema = async () => {
    try {
      clearError();
      setIsInitialized(true);
      setVerificacaoCompleta(false);
      setResultadoVerificacao(null);
      
      await startDetection();
    } catch (err) {
      console.error('Erro ao iniciar sistema:', err);
      console.log('Erro ao iniciar sistema. Verifique as permissões da câmera.');
      setIsInitialized(false);
    }
  };

  const realizarVerificacao = async () => {
    try {
      clearError();
      
      // Validar se está na distância correta
      if (!isAtIdealDistance) {
        const errorMessage = 'Posicione-se na distância ideal antes de verificar.';
        showValidationErrors([errorMessage]);
        return;
      }

      console.log('Capturando dados biométricos...');
      
      // Aguardar o descriptor estar disponível (com timeout de 5 segundos)
      let descriptor: number[];
      
      if (currentDescriptor && currentDescriptor.length > 0) {
        descriptor = currentDescriptor;
      } else {
        try {
          descriptor = await aguardarDescriptor(5000);
        } catch (timeoutError) {
          console.log('Tempo esgotado. Mantenha-se na posição ideal e tente novamente.', timeoutError);
          return;
        }
      }

      // Validar o descriptor
      const validation = validateDescriptor(descriptor, isAtIdealDistance);
      if (!validation.isValid) {
        console.log('Erro na captura biométrica. Tente novamente.');
        showValidationErrors(validation.errors);
        return;
      }

      console.log('Verificando no banco de dados...');
      
      // Realizar a verificação usando a API
      const resultado = await verificarRosto(descriptor);
      
      setResultadoVerificacao(resultado);
      setVerificacaoCompleta(true);

      if (resultado.existe && resultado.dados) {
        console.log('Dados do usuário encontrado:', resultado.dados.usuario); 
      } else {
        console.log('❌ Usuário não encontrado no sistema.');
      }
      
    } catch (err) {
      console.error('Erro na verificação:', err);
    }
  };

  const reiniciarProcesso = () => {
    setVerificacaoCompleta(false);
    setResultadoVerificacao(null);
  };

  const pararSistema = () => {
    stopDetection();
    setIsInitialized(false);
    setVerificacaoCompleta(false);
    setResultadoVerificacao(null);
  };

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

  // Determinar a cor da borda do vídeo baseada no status
  const getBorderColor = () => {
    if (!isDetecting) return 'border-gray-300';
    if (distanceStatus.isIdeal) return 'border-green-500';
    if (distanceStatus.status === 'sem_face') return 'border-red-500';
    return 'border-yellow-500';
  };

  return (
    <div className="bg-gray-200 py-8 px-6 flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-4xl text-center mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          🔍 Verificação de Cadastro
        </h1>
        
        <div className="relative mx-auto my-5 w-full max-w-2xl h-96 md:h-[480px]">
          <video 
            ref={videoRef}
            width="640" 
            height="480" 
            autoPlay 
            muted 
            playsInline
            className={`absolute top-0 left-0 w-full h-full rounded-lg border-4 object-cover transition-colors duration-300 ${getBorderColor()}`}
          />
          <canvas 
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
          />
          
          {/* Indicador de status sobreposto */}
          {isDetecting && (
            <div className="absolute top-4 left-4 right-4">
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                distanceStatus.isIdeal 
                  ? 'bg-green-300 text-green-800 border border-green-300' 
                  : 'bg-red-300 text-red-800 border border-yellow-300'
              }`}>
                {getDistanceMessage(distanceStatus.status)}
              </div>
            </div>
          )}
        </div>
        
        {/* Mostrar erros se houver */}
        {(apiError || faceError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {apiError || faceError}
          </div>
        )}

        {/* Mostrar resultado da verificação */}
        {verificacaoCompleta && resultadoVerificacao && (
          <div className={`mb-4 p-4 rounded-lg ${
            resultadoVerificacao.existe 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {resultadoVerificacao.existe ? (
              <div className='mt-6'>
                <h3 className="font-bold text-lg mb-2">✅Rosto encontrado. Acesso autorizado!</h3>
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