export const formatarTempo = (ms: number): string => {
  if (ms <= 0) return "alguns segundos";

  const minutos = Math.floor(ms / 60000);
  const segundos = Math.floor((ms % 60000) / 1000);

  if (minutos > 0) {
    return `${minutos} minuto${minutos > 1 ? "s" : ""} e ${segundos} segundo${segundos > 1 ? "s" : ""}`;
  }
  return `${segundos} segundo${segundos > 1 ? "s" : ""}`;
};

export const calcularTempoRestante = (bloqueadoAte: string, agora: number = Date.now()): number => {
  const dataDesbloqueio = new Date(bloqueadoAte).getTime();
  const diferenca = dataDesbloqueio - agora;
  return diferenca > 0 ? diferenca : 0;
};
