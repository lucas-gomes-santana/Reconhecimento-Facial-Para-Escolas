export const descriptorValido: number[] = Array(128).fill(0).map(() => Math.random() * 2 - 1);

export const descriptorSimilar: number[] = descriptorValido.map(
  (v) => v + (Math.random() * 0.02 - 0.01),
);

export const descriptorDiferente: number[] = Array(128).fill(0).map(() => Math.random() * 2 - 1);

export const descriptorMesmoRosto: number[] = [...descriptorValido];

export const descriptorZeros: number[] = Array(128).fill(0);

export const descriptorValoresAltos: number[] = Array(128).fill(0).map(() => Math.random() * 10);

export function gerarDescriptor(seed: number = Math.random()): number[] {
  const gerado: number[] = [];
  for (let i = 0; i < 128; i++) {
    gerado.push(Math.sin(seed * i) * 2 - 1);
  }
  return gerado;
}
