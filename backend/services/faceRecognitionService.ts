import { cosineSimilarity, cosineSimilarityBatch } from "face-api.js";

import Usuario, { type IUsuario } from "../models/Usuario.ts";
import { threshold } from "../utils/threshold.ts";

interface MatchResult {
  usuario: IUsuario;
  similaridade: number;
}

export class FaceRecognitionService {
  private threshold = threshold;

  calcularSimilaridadeCossenos(descriptor1: number[], descriptor2: number[]): number {
    if (descriptor1.length !== descriptor2.length) {
      return 0;
    }

    return cosineSimilarity(descriptor1, descriptor2);
  }

  /**
   * Busca vetorizada: a lib monta uma matriz única de todos os usuarios do banco de dados
   e compara ela com a matriz do usuário (`cosineSimilarityBatch`). Aqui fica só a
   * orquestração: ler do banco, achar o maior índice e aplicar o threshold.
   */
  async encontrarUsuarioPorSimilaridade(
    descriptorBusca: number[],
    threshold?: number,
  ): Promise<MatchResult | null> {
    const usuarios = await Usuario.find({});

    if (usuarios.length === 0) {
      return null;
    }

    const similaridades = await cosineSimilarityBatch(
      descriptorBusca,
      usuarios.map((u) => u.descriptor),
    );

    let melhorIndice = -1;
    let maiorSimilaridade = -Infinity;

    for (let i = 0; i < similaridades.length; i++) {
      if (similaridades[i]! > maiorSimilaridade) {
        maiorSimilaridade = similaridades[i]!;
        melhorIndice = i;
      }
    }

    const limiar = threshold ?? this.threshold;

    if (melhorIndice === -1 || maiorSimilaridade <= limiar) {
      return null;
    }

    return {
      usuario: usuarios[melhorIndice]!,
      similaridade: maiorSimilaridade,
    };
  }

  async verificarRostoExistente(
    descriptor: number[],
    threshold?: number,
  ): Promise<IUsuario | null> {
    const match = await this.encontrarUsuarioPorSimilaridade(descriptor, threshold);
    return match ? match.usuario : null;
  }
}
