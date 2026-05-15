export const descriptorValido = Array(128).fill(0).map(() => Math.random() * 2 - 1);

export const descriptorSimilar = descriptorValido.map((v) => v + (Math.random() * 0.02 - 0.01));

export const descriptorDiferente = Array(128).fill(0).map(() => Math.random() * 2 - 1);

export const descriptorMesmoRosto = [...descriptorValido];

export const descriptorZeros = Array(128).fill(0);

export const descriptorValoresAltos = Array(128).fill(0).map(() => Math.random() * 10);

export function gerarDescriptor(seed = Math.random()) {
  const gerado = [];
  for (let i = 0; i < 128; i++) {
    gerado.push((Math.sin(seed * i) * 2 - 1));
  }
  return gerado;
}