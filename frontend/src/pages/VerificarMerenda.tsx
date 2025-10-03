import { useEffect } from 'react';
import { useApi } from '../hooks/api/useApi';
import { useFaceDetection } from '../hooks/detection/useFaceDetection';
import { useVerificacao } from '../hooks/auth/useVerificacao';
import { useValidation } from '../hooks/validation/useValidation';
import { useVerificarStatus } from '../hooks/auth/useVerificarStatus';
import '../styles/index.css';

function VerificarMerenda() {
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
        reiniciarProcesso,
        pararSistema,
        iniciarSistema,
        isInitialized,
        videoRef,       
        canvasRef,         
        distanceStatus,     
        isAtIdealDistance,  
        isDetecting,
        currentDescriptor,
        aguardarDescriptor,
        setResultadoVerificacao,
        setVerificacaoCompleta
    } = useVerificacao();

    const { verificarEBloquear } = useVerificarStatus();
  
    useEffect(() => {
        if (apiError) {
            console.log(`Erro: ${apiError}`);
        } else if (faceError) {
            console.log(`Erro: ${faceError}`);
        }
    }, [apiError, faceError]);

   const realizarVerificacaoMerenda = async () => {
        try {
            // ✅ DEBUG: Verificar todos os estados
            console.log('=== DEBUG INICIAL ===');
            console.log('isAtIdealDistance:', isAtIdealDistance);
            console.log('currentDescriptor existe?', !!currentDescriptor);
            console.log('currentDescriptor length:', currentDescriptor?.length);
            console.log('isDetecting:', isDetecting);
            
            if (!isAtIdealDistance) {
                console.log('Posicione-se na distância ideal antes de verificar.');
                return;
            }

            console.log('Capturando dados biométricos...');
            
            // ✅ TENTAR AGUARDAR com timeout menor e mais informações
            let descriptor: number[];
            
            try {
                console.log('Tentando aguardar descriptor...');
                descriptor = await aguardarDescriptor(3000); // Reduzir para 3 segundos para teste
                console.log('Descriptor capturado com sucesso! Length:', descriptor.length);
            } catch (timeoutError) {
                console.log('ERRO ao aguardar descriptor:', timeoutError);
                console.log('Estado no momento do erro:');
                console.log('- currentDescriptor:', currentDescriptor);
                console.log('- isAtIdealDistance:', isAtIdealDistance);
                return;
            }

            console.log('Verificando status de merenda...');
            
            const resultado = await verificarEBloquear(descriptor);
            
            setResultadoVerificacao({
                existe: resultado.sucesso || resultado.dados !== null,
                dados: resultado.dados ? {
                    usuario: resultado.dados,
                    similaridade: 0,
                    distancia: 0,
                } : null,
                bloqueado: resultado.bloqueado,
                mensagem: resultado.mensagem,
            });

            setVerificacaoCompleta(true);

        } catch (err) {
            console.error('Erro na verificação de merenda:', err);
        }
    };  

    const renderResultado = () => {
        if (!verificacaoCompleta || !resultadoVerificacao) return null;

        if (!resultadoVerificacao.existe) {
            return (
                <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-400">
                    <h3 className="font-bold text-lg mb-2 text-red-800">
                        ❌ Usuário não encontrado
                    </h3>
                    <p className="text-red-700">
                        Realize o cadastro antes de retirar merenda.
                    </p>
                </div>
            );
        }

        if (resultadoVerificacao.bloqueado) {
            return (
                <div className="mb-4 p-4 rounded-lg bg-red-200 border border-yellow-400">
                    <h3 className="font-bold text-lg mb-2 text-yellow-800">
                        ⚠️ Acesso Negado
                    </h3>
                    <p className="text-yellow-800">
                        <span className="font-bold">{resultadoVerificacao.dados?.usuario?.nome}</span>, 
                        você já retirou merenda!
                    </p>
                    {resultadoVerificacao.mensagem && (
                        <p className="text-sm mt-2 text-yellow-600">
                            {resultadoVerificacao.mensagem}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div className="mb-4 p-4 rounded-lg bg-green-100 border border-green-400">
                <h3 className="font-bold text-lg mb-2 text-green-800">
                    ✅ Merenda Liberada!
                </h3>
                <p className="text-green-700">
                    Bem-vindo(a), <span className="font-bold">{resultadoVerificacao.dados?.usuario?.nome}</span>!
                </p>
                <p className="text-sm mt-2 text-green-600">
                    Você poderá retirar merenda novamente em 1 minuto.
                </p>
            </div>
        );
    };
  
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
                    onClick={realizarVerificacaoMerenda}
                    disabled={!isAtIdealDistance || apiLoading}
                    className="bg-green-500 text-white border-none py-3 px-5 rounded cursor-pointer text-base transition-colors duration-300 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {apiLoading ? 'Verificando...' : 'Verificar e Liberar'}
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
                    🍽️ Verificação de Merenda
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
          
                {(apiError || faceError) && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-700 text-red-700 rounded">
                        {apiError || faceError}
                    </div>
                )}
  
                {renderResultado()}
          
                {renderBotaoAcao()}
            </div>
        </div>
    );
}

export default VerificarMerenda;