import { useEffect } from 'react';
import { useApi } from '../hooks/api/useApi';
import { useFaceDetection } from '../hooks/detection/useFaceDetection';
import { useVerificacao } from '../hooks/auth/useVerificacao';
import { useValidation } from '../hooks/validation/useValidation';
import { useVerificarStatus } from '../hooks/auth/useVerificarStatus';
import VideoCanvasDetector from '../components/VideoAndCanvas';
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
        aguardarDescriptor,
        setResultadoVerificacao,
        setVerificacaoCompleta,
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
            if (!isAtIdealDistance) {
                console.log('Posicione-se na distância ideal antes de verificar.');
                return;
            }

            console.log('Capturando dados biométricos...');
            
            let descriptor: number[];
            
            try {
                descriptor = await aguardarDescriptor(3000);

            } catch (timeoutError) {
                console.log('Erro ao aguardar descriptor:', timeoutError);
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
  
    return (
        <div className="bg-gray-200 py-8 px-6 flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-4xl text-center mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                    🍽️ Verificação de Merenda
                </h1>
          
                {/* ⬇️ CORRIGIDO: Adicionadas as props corretas */}
                <VideoCanvasDetector
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    isDetecting={isDetecting}
                    distanceStatus={distanceStatus}
                    getDistanceMessage={getDistanceMessage}
                />
          
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