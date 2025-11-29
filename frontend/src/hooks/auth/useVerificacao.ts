/* eslint-disable react-hooks/exhaustive-deps */
import { useApi } from "../api/useApi";
import { useFaceDetection } from "../detection/useFaceDetection";
import { useValidation } from "../validation/useValidation";
import { useAuth } from "./useAuth";
import { useEffect, useState, useCallback } from "react";
import { baseURL } from "../../config/url";
import type { VerificarRostoResponse } from "../../types/face.type";


export const useVerificacao = () => {
    const {
        clearError,
        error: apiError,
        setError,
        setLoading,
        handleApiError,
    } = useApi();
    
    const {
        isDetecting,
        currentDescriptor,
        isAtIdealDistance,
        error: faceError,
        startDetection,
        stopDetection,
        aguardarDescriptor,
        videoRef,
        canvasRef,
        distanceStatus
    } = useFaceDetection();
    
    const { 
        validateDescriptor, 
        showValidationErrors 
    } = useValidation();

    const { authenticatedFetch } = useAuth();

    const [isInitialized, setIsInitialized] = useState(false);
    const [verificacaoCompleta, setVerificacaoCompleta] = useState(false);
    const [resultadoVerificacao, setResultadoVerificacao] = useState<VerificarRostoResponse | null>(null);

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
            
            if (!isAtIdealDistance) {
                const errorMessage = 'Posicione-se na distância ideal antes de verificar.';
                showValidationErrors([errorMessage]);
                return;
            }

            console.log('Capturando dados biométricos...');
            
            let descriptor: number[];
            
            if (currentDescriptor && currentDescriptor.length > 0) {
                descriptor = currentDescriptor;
            } else {
                try {
                    descriptor = await aguardarDescriptor(6000);
                } catch (timeoutError) {
                    console.log('Tempo esgotado, tente novamente.', timeoutError);
                    return;
                }
            }

            const validation = validateDescriptor(descriptor, isAtIdealDistance);
            
            if (!validation.isValid) {
                console.log('Erro na captura biométrica. Tente novamente.');
                showValidationErrors(validation.errors);
                return;
            }

            console.log('Verificando no banco de dados...');
            const resultado = await verificarRosto(descriptor, 'verificacao');
            
            
            setResultadoVerificacao(resultado);
            setVerificacaoCompleta(true);
            
        } catch (err) {
            console.error('Erro na verificação:', err);
        }
    };

    const verificarRosto = useCallback(async (descriptor: number[], contexto: string): Promise<VerificarRostoResponse> => {
        setLoading(true);
        setError(null);
        
        try {
          console.log('Verificando rosto...');
          
          const response = await authenticatedFetch(`${baseURL}/verificar-rosto`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ descriptor, contexto })
          });
    
          const responseText = await response.text();
          let data;
          
          try {
            data = responseText ? JSON.parse(responseText) : {};
          } catch (parseError) {
            console.error('Erro ao parsear resposta:', parseError, 'Resposta:', responseText);
            throw new Error(`Resposta inválida do servidor: ${response.status} ${response.statusText}`);
          }
    
          if (!response.ok) {
            throw new Error(data.error || data.message || `Erro HTTP: ${response.status}`);
          }
    
          const result: VerificarRostoResponse = {
            existe: data.encontrado || false,
            bloqueado: data.bloqueado || false,  
            dados: data.encontrado ? {
                usuario: {
                    id: data.usuario?.id || '',
                    nome: data.usuario?.nome || '',
                    tipoUsuario: data.usuario?.tipoUsuario || '',
                    dataCadastro: data.usuario?.dataCadastro || '',
                    status: data.usuario?.status, 
                    bloqueadoAte: data.usuario?.bloqueadoAte, 
                },
                similaridade: data.similaridade || 0,
                distancia: data.distancia || 0,
            } : null
          }
          
          return result;
          
        } catch (err) {
            const apiError = handleApiError(err);
            setError(apiError.message);
            console.error('Erro na verificação:', apiError);
            throw apiError;
    
        } finally {
            setLoading(false);
        }
      }, [baseURL, handleApiError]);

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

    return {
        iniciarSistema,
        realizarVerificacao,
        pararSistema,
        reiniciarProcesso,
        isInitialized,
        isDetecting,
        verificacaoCompleta,
        resultadoVerificacao,
        verificarRosto,
        videoRef,     
        canvasRef,    
        distanceStatus,
        isAtIdealDistance,
        setVerificacaoCompleta,
        setResultadoVerificacao,
        currentDescriptor,
        aguardarDescriptor, 
    }
}

