import { useState, useEffect, useRef } from "react";

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
    isAtIdealDistance,
  } = useVerificacao();

  const { authenticatedFetch } = useAuth();

  const { setLoading, setError } = useApi();

  const [status, setStatus] = useState({
    usuarioBloqueado: false,
    tempoRestante: null as string | null,
    podeRetirar: false,
  });

  const [tempoRestanteMs, setTempoRestanteMs] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Efeito para gerenciar a contagem regressiva
  useEffect(() => {
    if (tempoRestanteMs !== null && tempoRestanteMs > 0) {
      intervalRef.current = setInterval(() => {
        setTempoRestanteMs((prev) => {
          if (prev === null || prev <= 1000) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setStatus({
              usuarioBloqueado: false,
              tempoRestante: null,
              podeRetirar: true,
            });
            return null;
          }
          return prev - 1000;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tempoRestanteMs]);

  // Efeito para atualizar o texto do tempo restante
  useEffect(() => {
    if (tempoRestanteMs !== null && tempoRestanteMs > 0) {
      const texto = formatarTempo(tempoRestanteMs);
      setStatus((prev) => ({
        ...prev,
        tempoRestante: texto,
      }));
    }
  }, [tempoRestanteMs]);

  const formatarTempo = (ms: number) => {
    if (ms <= 0) return "alguns segundos";

    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);

    if (minutos > 0) {
      return `${minutos} minuto${minutos > 1 ? "s" : ""} e ${segundos} segundo${segundos > 1 ? "s" : ""}`;
    }
    return `${segundos} segundo${segundos > 1 ? "s" : ""}`;
  };

  const calcularTempoRestante = (bloqueadoAte: string) => {
    const agora = new Date().getTime();
    const dataDesbloqueio = new Date(bloqueadoAte).getTime();
    const diferenca = dataDesbloqueio - agora;

    return diferenca > 0 ? diferenca : 0;
  };

  const verificarEBloquear = async (descriptor: number[]) => {
    try {
      const resultado = await verificarRosto(descriptor, "verificacao");

      if (!resultado.existe) {
        return {
          sucesso: false,
          mensagem: "Usuário não encontrado",
          dados: null,
        };
      }

      if (resultado.bloqueado) {
        const ms = calcularTempoRestante(resultado.dados?.usuario?.bloqueadoAte || "");

        setTempoRestanteMs(ms);
        setStatus({
          usuarioBloqueado: true,
          tempoRestante: formatarTempo(ms),
          podeRetirar: false,
        });

        return {
          sucesso: false,
          mensagem: `Você já retirou merenda. Aguarde ${formatarTempo(ms)}`,
          dados: resultado.dados?.usuario || null,
          bloqueado: true,
        };
      }

      await bloquearUsuario(resultado.dados?.usuario?.id || "");

      setStatus({
        usuarioBloqueado: false,
        tempoRestante: null,
        podeRetirar: true,
      });

      return {
        sucesso: true,
        mensagem: "Merenda liberada! Usuário bloqueado por 1 minuto.",
        dados: resultado.dados?.usuario || null,
        bloqueado: false,
      };
    } catch (error) {
      console.error("Erro na verificação de status: ", error);
      throw error;
    }
  };

  const bloquearUsuario = async (id: string) => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`${baseURL}/usuarios/bloquear/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao bloquear usuário");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao tentar bloquear usuário: ", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const realizarVerificacaoMerenda = async () => {
    try {
      if (!isAtIdealDistance) {
        console.log("Posicione-se na distância ideal antes de verificar.");
        return;
      }

      console.log("Capturando dados biométricos...");

      let descriptor: number[];

      try {
        descriptor = await aguardarDescriptor(3000);
      } catch (timeoutError) {
        console.log("Erro ao aguardar descriptor:", timeoutError);
        return;
      }

      console.log("Verificando status de merenda...");

      const resultado = await verificarEBloquear(descriptor);

      setResultadoVerificacao({
        existe: resultado.sucesso || resultado.dados !== null,
        dados: resultado.dados
          ? {
              usuario: resultado.dados,
              similaridade: 0,
              distancia: 0,
            }
          : null,
        bloqueado: resultado.bloqueado,
      });

      setVerificacaoCompleta(true);
    } catch (err) {
      console.error("Erro na verificação de merenda:", err);
    }
  };

  return {
    bloquearUsuario,
    verificarEBloquear,
    status,
    realizarVerificacaoMerenda,
  };
};
