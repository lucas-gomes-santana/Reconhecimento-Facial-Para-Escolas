import Usuario, { type IUsuario } from "../models/Usuario.ts";
import { threshold } from "../utils/threshold.ts";

interface MatchResult {
  usuario: IUsuario;
  similaridade: number;
}

export class FaceRecognitionService {
  private threshold = threshold;

  // Compara os vetores (arrays) dos rostos usando similaridade de cossenos
  calcularSimilaridadeCossenos(descriptor1: number[], descriptor2: number[]): number {
    if (descriptor1.length !== descriptor2.length) {
      return 0;
    }

    let produtoPonto = 0.0;
    let norma1 = 0.0;
    let norma2 = 0.0;

    for (let i = 0; i < descriptor1.length; i++) {
      const d1 = descriptor1[i]!;
      const d2 = descriptor2[i]!;
      produtoPonto += d1 * d2;
      norma1 += Math.pow(d1, 2);
      norma2 += Math.pow(d2, 2);
    }

    const magnitude = Math.sqrt(norma1) * Math.sqrt(norma2);

    // Evita divisão por zero
    if (magnitude === 0) {
      return 0;
    }

    // Retorna a similaridade entre (0 para sem semelhança a 1 para similaridade máxima)
    return produtoPonto / magnitude;
  }

  async encontrarUsuarioPorSimilaridade(
    descriptorBusca: number[],
    threshold?: number,
  ): Promise<MatchResult | null> {
    const usuarios = await Usuario.find({});

    let melhorMatch: MatchResult | null = null;
    // Procuramos a maior similaridade possível nos rostos cadastrados no banco de dados
    let maiorSimilaridade = -Infinity; // Começa com o valor mais baixo possível

    for (const usuario of usuarios) {
      const similaridade = this.calcularSimilaridadeCossenos(descriptorBusca, usuario.descriptor);

      console.log(`Comparando com ${usuario.nome}: similaridade = ${similaridade.toFixed(4)}`);

      if (similaridade > (threshold ?? this.threshold) && similaridade > maiorSimilaridade) {
        maiorSimilaridade = similaridade;
        melhorMatch = {
          usuario,
          similaridade: maiorSimilaridade,
        };
      }
    }

    return melhorMatch;
  }

  async verificarRostoExistente(
    descriptor: number[],
    threshold?: number,
  ): Promise<IUsuario | null> {
    const match = await this.encontrarUsuarioPorSimilaridade(descriptor, threshold);
    return match ? match.usuario : null;
  }
}
