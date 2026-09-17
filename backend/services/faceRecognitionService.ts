import * as tf from "@tensorflow/tfjs-node";
import Usuario, { type IUsuario } from "../models/Usuario.ts";
import { threshold } from "../utils/threshold.ts";

interface MatchResult {
  usuario: IUsuario;
  similaridade: number;
}

export class FaceRecognitionService {
  private threshold = threshold;

  /**
   * Comparação par-a-par (mantida para compatibilidade e para casos pontuais
   * onde você só precisa comparar dois descritores isolados, ex: testes).
   */
  calcularSimilaridadeCossenos(descriptor1: number[], descriptor2: number[]): number {
    if (descriptor1.length !== descriptor2.length) {
      return 0;
    }

    let produtoPonto = 0.0;
    let norma1 = 0.0;
    let norma2 = 0.0;

    for (let i = 0; i < descriptor1.length; i++) {
      produtoPonto += descriptor1[i]! * descriptor2[i]!;
      norma1 += Math.pow(descriptor1[i]!, 2);
      norma2 += Math.pow(descriptor2[i]!, 2);
    }

    const magnitude = Math.sqrt(norma1) * Math.sqrt(norma2);

    if (magnitude === 0) {
      return 0;
    }

    return produtoPonto / magnitude;
  }

  /**
   * Versão vetorizada: em vez de percorrer os usuários um a um em JS,
   * monta uma matriz (n_usuarios x 128) com todos os descritores do banco
   * e faz UMA multiplicação matriz-vetor otimizada (BLAS, via tfjs-node)
   * para obter todas as similaridades de cosseno de uma vez só.
   *
   * Continua sendo uma busca exata (O(n) em termos de dado lido do banco),
   * mas o cálculo em si deixa de ser um loop interpretado e passa a rodar
   * em código nativo altamente otimizado — o ganho de performance é grande
   * mesmo mantendo a mesma garantia de correção (nenhum falso positivo por
   * aceitar o primeiro match acima do threshold).
   */
  async encontrarUsuarioPorSimilaridade(
    descriptorBusca: number[],
    threshold?: number,
  ): Promise<MatchResult | null> {
    const usuarios = await Usuario.find({});

    if (usuarios.length === 0) {
      return null;
    }

    // Matriz (n_usuarios x 128) — uma linha por usuário cadastrado
    const matrizDescritores = tf.tensor2d(usuarios.map((u) => u.descriptor));

    // Vetor do rosto escaneado (128,)
    const vetorBusca = tf.tensor1d(descriptorBusca);

    // Normalizar tudo para vetores unitários: assim, similaridade de cosseno
    // vira simplesmente um produto escalar (dot product), que é a operação
    // mais barata e mais otimizada que existe em álgebra linear.
    const normaLinhas = matrizDescritores.norm("euclidean", 1).reshape([-1, 1]);
    const matrizNormalizada = matrizDescritores.div(normaLinhas);
    const vetorNormalizado = vetorBusca.div(vetorBusca.norm("euclidean"));

    // Multiplicação matriz-vetor: calcula a similaridade com TODOS os
    // usuários numa única operação nativa, em vez de 1 iteração JS por usuário.
    const similaridades = matrizNormalizada.dot(vetorNormalizado) as tf.Tensor1D;

    const similaridadesArray = Array.from(await similaridades.data());

    // Tensores do TF.js não são coletados pelo garbage collector do JS —
    // precisam ser liberados manualmente para evitar vazamento de memória.
    tf.dispose([
      matrizDescritores,
      vetorBusca,
      normaLinhas,
      matrizNormalizada,
      vetorNormalizado,
      similaridades,
    ]);

    // Ainda assim varremos o array de resultados (já calculados) para achar
    // o maior — mas aqui é só um loop sobre números, não sobre 128 dimensões
    // por usuário, então é ordens de magnitude mais rápido.
    let melhorIndice = -1;
    let maiorSimilaridade = -Infinity;

    for (let i = 0; i < similaridadesArray.length; i++) {
      if (similaridadesArray[i]! > maiorSimilaridade) {
        maiorSimilaridade = similaridadesArray[i]!;
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
