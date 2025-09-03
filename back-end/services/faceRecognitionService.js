import Usuario from "../models/Usuario.js";

class FaceRecognitionService {
    
    // Escanea rostos com base em distância euclidiana
    calcularDistanciaEuclidiana(descriptor1, descriptor2) {
        if (descriptor1.length !== descriptor2.length) {
            return Infinity;
        }
        
        let soma = 0;
        for (let i = 0; i < descriptor1.length; i++) {
            soma += Math.pow(descriptor1[i] - descriptor2[i], 2);
        }
        
        return Math.sqrt(soma);
    }

    // Encontra os rostos dos usuários com base em similaridade dos vetores de rostos
    async encontrarUsuarioPorSimilaridade(descriptorBusca, threshold = 0.6) {
        const usuarios = await Usuario.find({});
        
        let melhorMatch = null;
        let menorDistancia = Infinity;
        
        for (const usuario of usuarios) {
            const distancia = this.calcularDistanciaEuclidiana(descriptorBusca, usuario.descriptor);
            
            console.log(`Comparando com ${usuario.nome}: distância = ${distancia.toFixed(4)}`);
            
            if (distancia < threshold && distancia < menorDistancia) {
                menorDistancia = distancia;
                melhorMatch = {
                    usuario,
                    distancia,
                    similaridade: Math.max(0, 1 - (distancia / threshold))
                };
            }
        }
        
        return melhorMatch;
    }

    // Verificar o rosto escaneado no front-end com os do banco de dados
    async verificarRostoExistente(descriptor, threshold = 0.6) {
        const match = await this.encontrarUsuarioPorSimilaridade(descriptor, threshold);
        return match ? match.usuario : null;
    }
}

export default new FaceRecognitionService();