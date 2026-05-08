import Usuario from "../models/Usuario.js";

let threshold = 0.96; // Percentual mínimo de 96% de similaridade para sucesso na autenticação facial

export class FaceRecognitionService {
  constructor() {
    this.threshold = threshold;
  }

  // Compara os veteores(arrays) dos rostos usando similaridade de cossenos
  calcularSimilaridadeCossenos(descriptor1, descriptor2) {
    if (descriptor1.length !== descriptor2.length) {
      return 0;
    }

    let produtoPonto = 0.0;
    let norma1 = 0.0;
    let norma2 = 0.0;

    for (let i = 0; i < descriptor1.length; i++) {
      produtoPonto += descriptor1[i] * descriptor2[i];
      norma1 += Math.pow(descriptor1[i], 2);
      norma2 += Math.pow(descriptor2[i], 2);
    }

    const magnitude = Math.sqrt(norma1) * Math.sqrt(norma2);

    // Evita divisão por zero
    if (magnitude === 0) {
      return 0;
    }

    // Retorna a similaridade entre (0 para sem semelhança a 1 para similaridade máxima)
    return produtoPonto / magnitude;
  }

  async encontrarUsuarioPorSimilaridade(descriptorBusca, threshold) {
    const usuarios = await Usuario.find({});

    let melhorMatch = null;
    // Procuramos a maior similaridade possível nos rostos cadastrados no banco de dados
    let maiorSimilaridade = -Infinity; // Começa com o valor mais baixo possível

    for (const usuario of usuarios) {
      const similaridade = this.calcularSimilaridadeCossenos(descriptorBusca, usuario.descriptor);

      console.log(`Comparando com ${usuario.nome}: similaridade = ${similaridade.toFixed(4)}`);

      if (similaridade > threshold && similaridade > maiorSimilaridade) {
        maiorSimilaridade = similaridade;
        melhorMatch = {
          usuario: usuario,
          similaridade: maiorSimilaridade,
        };
      }
    }

    return melhorMatch;
  }

  async verificarRostoExistente(descriptor, threshold) {
    const match = await this.encontrarUsuarioPorSimilaridade(descriptor, threshold);
    return match ? match.usuario : null;
  }
}
