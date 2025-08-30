import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useValidation } from '../hooks/useValidation';
import '../styles/index.css';

function Verificacao() {
  const { verificarRosto, loading: apiLoading, error: apiError, clearError } = useApi();
  const {
    videoRef,
    canvasRef,
    isDetecting,
    modelsLoaded,
    currentDescriptor,
    isAtIdealDistance,
    distanceStatus,
    loading: faceLoading,
    error: faceError,
    videoReady,
    isVideoLoading,
    startDetection,
    stopDetection,
    aguardarDescriptor
  } = useFaceDetection();
  
  const { 
    validateDescriptor, 
    getDistanceMessage, 
    showValidationErrors 
  } = useValidation();

  const [status, setStatus] = useState('Clique em "Iniciar Verificação" para começar');
  const [isInitialized, setIsInitialized] = useState(false);
  const [verificacaoCompleta, setVerificacaoCompleta] = useState(false);
  const [resultadoVerificacao, setResultadoVerificacao] = useState<any>(null);

  // Efeito para atualizar o status baseado no estado da detecção
  useEffect(() => {
    if (!isDetecting) {
      if (!isInitialized) {
        setStatus('Clique em "Iniciar Verificação" para começar');
      }
      return;
    }

    if (isVideoLoading) {
      setStatus('Inicializando câmera...');
      return;
    }

    if (!videoReady) {
      setStatus('Preparando vídeo...');
      return;
    }

    // Atualizar status baseado na distância
    const distanceMessage = getDistanceMessage(distanceStatus.status);
    setStatus(distanceMessage);
  }, [isDetecting, isVideoLoading, videoReady, distanceStatus, getDistanceMessage, isInitialized]);

  // Efeito para limpar erros quando necessário
  useEffect(() => {
    if (apiError) {
      setStatus(`Erro: ${apiError}`);
    } else if (faceError) {
      setStatus(`Erro: ${faceError}`);
    }
  }, [apiError, faceError]);

  const iniciarSistema = async () => {
    try {
      clearError();
      setStatus('Iniciando sistema de reconhecimento facial...');
      setIsInitialized(true);
      setVerificacaoCompleta(false);
      setResultadoVerificacao(null);
      
      await startDetection();
      setStatus('Sistema iniciado. Posicione seu rosto na câmera.');
    } catch (err) {
      console.error('Erro ao iniciar sistema:', err);
      setStatus('Erro ao iniciar sistema. Verifique as permissões da câmera.');
      setIsInitialized(false);
    }
  };

  const realizarVerificacao = async () => {
    try {
      clearError();
      
      // Validar se está na distância correta
      if (!isAtIdealDistance) {
        const errorMessage = 'Posicione-se na distância ideal antes de verificar.';
        setStatus(errorMessage);
        showValidationErrors([errorMessage]);
        return;
      }

      setStatus('Capturando dados biométricos...');
      
      // Aguardar o descriptor estar disponível (com timeout de 5 segundos)
      let descriptor: number[];
      
      if (currentDescriptor && currentDescriptor.length > 0) {
        descriptor = currentDescriptor;
      } else {
        try {
          descriptor = await aguardarDescriptor(5000);
        } catch (timeoutError) {
          setStatus('Tempo esgotado. Mantenha-se na posição ideal e tente novamente.');
          return;
        }
      }

      // Validar o descriptor
      const validation = validateDescriptor(descriptor, isAtIdealDistance);
      if (!validation.isValid) {
        setStatus('Erro na captura biométrica. Tente novamente.');
        showValidationErrors(validation.errors);
        return;
      }

      setStatus('Verificando no banco de dados...');
      
      // Realizar a verificação usando a API
      const resultado = await verificarRosto(descriptor);
      
      setResultadoVerificacao(resultado);
      setVerificacaoCompleta(true);

      if (resultado.existe && resultado.dados) {
        const similaridade = (resultado.dados.similaridade * 100).toFixed(1);
        setStatus(`✅ Usuário reconhecido! Similaridade: ${similaridade}%`);
        
        // Aqui você pode adicionar lógica adicional, como:
        // - Redirecionar para dashboard
        // - Salvar log de acesso
        // - Enviar notificação
        console.log('Dados do usuário encontrado:', resultado.dados.usuario);
        
      } else {
        setStatus('❌ Usuário não encontrado no sistema.');
      }
      
    } catch (err) {
      console.error('Erro na verificação:', err);
      setStatus('❌ Erro durante a verificação. Tente novamente.');
    }
  };

  const reiniciarProcesso = () => {
    setVerificacaoCompleta(false);
    setResultadoVerificacao(null);
    setStatus('Posicione seu rosto na câmera para nova verificação.');
  };

  const pararSistema = () => {
    stopDetection();
    setIsInitialized(false);
    setVerificacaoCompleta(false);
    setResultadoVerificacao(null);
    setStatus('Sistema desligado. Clique em "Iniciar Verificação" para começar.');
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
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              }`}>
                {getDistanceMessage(distanceStatus.status)}
              </div>
            </div>
          )}
          
          <div className="absolute -bottom-8 left-0 w-full text-center text-gray-600 italic">
            {status}
          </div>
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
              <div>
                <h3 className="font-bold text-lg mb-2">✅ Acesso Autorizado</h3>
                <p>Similaridade: {(resultadoVerificacao.dados.similaridade * 100).toFixed(1)}%</p>
                <p>Distância: {resultadoVerificacao.dados.distancia.toFixed(4)}</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-lg mb-2">❌ Acesso Negado</h3>
                <p>Usuário não encontrado no sistema</p>
              </div>
            )}
          </div>
        )}
        
        {/* Indicadores de status do sistema */}
        <div className="flex justify-center gap-4 mb-6 text-sm">
          <div className={`flex items-center gap-2 ${modelsLoaded ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${modelsLoaded ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Modelos IA
          </div>
          <div className={`flex items-center gap-2 ${videoReady ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${videoReady ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Câmera
          </div>
          <div className={`flex items-center gap-2 ${isAtIdealDistance ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${isAtIdealDistance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            Posição Ideal
          </div>
        </div>
        
        {renderBotaoAcao()}
      </div>
    </div>
  );
}

export default Verificacao;