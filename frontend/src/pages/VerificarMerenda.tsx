import { useEffect } from 'react';
import { useApi } from '../hooks/api/useApi';
import { useFaceDetection } from '../hooks/detection/useFaceDetection';
import { useVerificacao } from '../hooks/auth/useVerificacao';
import { useValidation } from '../hooks/validation/useValidation';
import { useVerificarStatus } from '../hooks/auth/useVerificarStatus';
import VideoCanvasDetector from '../components/VideoAndCanvas';
import { Camera, CheckCircle, XCircle, AlertTriangle, Salad } from 'lucide-react';
import '../styles/index.css';


function VerificarMerenda() {
    const { 
        loading: apiLoading, 
        error: apiError, 
    } = useApi();
  
    const {
        loading: faceLoading,
        error: faceError,
        expressionStatus
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

    const { verificarEBloquear, status } = useVerificarStatus();
  

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
                <div className="p-6 rounded-lg bg-red-500/90 border-2 border-red-500">
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <XCircle className="w-8 h-8 text-white" />
                            <h3 className="font-bold text-lg text-white">
                                Usuário não encontrado
                            </h3>
                        </div>
                        <p className="text-white">
                            Realize o cadastro antes de retirar merenda.
                        </p>
                    </div>
                </div>
            );
        }

       if (resultadoVerificacao.bloqueado) {
        return (
            <div className="p-6 rounded-lg bg-yellow-500/90 border-2 border-yellow-500">
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-white" />
                        <h3 className="font-bold text-lg text-white">
                            Acesso Negado
                        </h3>
                    </div>
                    <p className="text-white">
                        <span className="font-bold">{resultadoVerificacao.dados?.usuario?.nome}</span>, 
                        você já retirou merenda.
                    </p>
                    {status.tempoRestante && (
                        <p className="text-white font-semibold text-lg">
                            Aguarde {status.tempoRestante}
                        </p>
                    )}
                </div>
            </div>
        );
    }

        return (
            <div className="p-6 rounded-lg bg-[#09ad5e]">
                <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-8 h-8 text-white" />
                        <h3 className="font-bold text-lg text-white">
                            Merenda Liberada!
                        </h3>
                    </div>
                    <p className="text-white">
                        Bem-vindo(a), <span className="font-bold">{resultadoVerificacao.dados?.usuario?.nome}</span>!
                    </p>
                    <p className="text-sm text-white/90">
                        Você poderá retirar merenda novamente em 1 minuto.
                    </p>
                </div>
            </div>
        );
    };
  
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
                    onClick={realizarVerificacaoMerenda}
                    disabled={!isAtIdealDistance || apiLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="w-5 h-5" />
                    {apiLoading ? 'Verificando...' : 'Verificar e Liberar'}
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
        <div className="min-h-screen flex items-center justify-center p-8]">
            <div className="w-full max-w-2xl bg-white border-none shadow-2xl rounded-2xl">
                {/* Header com ícones */}
                <div className="px-8 pt-8 pb-4">
                    <h1 className="text-center text-3xl font-semibold text-[#1E3A8A] flex items-center justify-center gap-3">
                        <div className="relative">
                            <Salad className="w-10 h-10" />
                        </div>
                        Verificação de Merenda
                    </h1>
                </div>
          
                {/* Conteúdo */}
                <div className="px-8 pb-8 space-y-6">
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
                        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2">
                            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{apiError || faceError}</span>
                        </div>
                    )}
  
                    {/* Resultado da Verificação */}
                    {renderResultado()}
          
                    {/* Botões de Ação */}
                    {renderBotaoAcao()}
                </div>
            </div>
        </div>
    );
}

export default VerificarMerenda;