import { useState } from "react";
import { useAuth } from "./useAuth";
import { baseURL } from "../../config/url";
import { useApi } from "../api/useApi";
import { useVerificacao } from "./useVerificacao";


export const useVerificarStatus = () => {
    const { 
        verificarRosto,
        setVerificacaoCompleta,
        setResultadoVerificacao,
        aguardarDescriptor,
        isAtIdealDistance
     } = useVerificacao();

    const { authenticatedFetch } = useAuth();
    
    const {
        setLoading,
        setError,
    } = useApi();

    const [status, setStatus] = useState({
        usuarioBloqueado: false,
        tempoRestante: null,
        podeRetirar: false
    });

    const verificarEBloquear = async (descriptor: number[]) => {
        try {
           const resultado = await verificarRosto(descriptor, 'verificacao');
           
           if (!resultado.existe) {
                return {
                    sucesso: false,
                    mensagem: 'Usuário não encontrado',
                    dados: null,
                };
           }

           if (resultado.bloqueado) {
                const tempoRestante = calcularTempoRestante(resultado.dados?.usuario?.bloqueadoAte || '');
                
                setStatus({
                    usuarioBloqueado: true,
                    tempoRestante: tempoRestante,
                    podeRetirar: false
                });

                return {
                    sucesso: false,
                    mensagem: `Você já retirou merenda. Aguarde ${tempoRestante}`,
                    dados: resultado.dados?.usuario || null,
                    bloqueado: true
                };
           }
           
           await bloquearUsuario(resultado.dados?.usuario?.id || '');
           
           setStatus({
                usuarioBloqueado: false,
                tempoRestante: null,
                podeRetirar: true
            });

            return {
                sucesso: true,
                mensagem: 'Merenda liberada! Usuário bloqueado por 1 hora.',
                dados: resultado.dados?.usuario || null, 
                bloqueado: false
            };


        } catch (error) {
            console.error("Erro na verificação de status: ", error);
            throw error;
        }
    }

    const calcularTempoRestante = (bloqueadoAte: string) => {
        const agora = new Date().getTime();
        const dataDesbloqueio = new Date(bloqueadoAte).getTime();
        const diferenca = dataDesbloqueio - agora;

        if (diferenca <= 0) return 'alguns segundos';

        const minutos = Math.floor(diferenca / 60000);
        const segundos = Math.floor((diferenca % 60000) / 1000);

        if (minutos > 0) {
            return `${minutos} minuto${minutos > 1 ? 's' : ''} e ${segundos} segundo${segundos > 1 ? 's' : ''}`;
        }
        return `${segundos} segundo${segundos > 1 ? 's' : ''}`;
    };

    const bloquearUsuario = async (id: string) => {
        try {
            setLoading(true);
            const response = await authenticatedFetch(`${baseURL}/usuarios/bloquear/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao bloquear usuário');
            }

            return await response.json();

        } catch (error) {
            console.error("Erro ao tentar bloquear usuário: ", error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            throw error;

        } finally {
            setLoading(false);
        }
    };

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

    return {
        bloquearUsuario,
        calcularTempoRestante,
        verificarEBloquear,
        status,
        realizarVerificacaoMerenda,
    }
}