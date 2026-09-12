# faceRecognitionService documentação

## Gargalo

O service que realiza a comparação do rosto escaneado no frontend com os rostos do banco de dados está usando algoritmo de força bruta para realizar essa função. Ou seja,
comparando com todos os usuários do banco de dados: O(n).

Apesar disso, os benchmarks feitos com Claude Sonnet mostraram velocidade aceitável na comparação:

| Rostos cadastrados | Tempo médio (em milissigundos) |
| ------------------ | ------------------------------ |
| 100                | 0,1ms                          |
| 1000               | 1,1ms                          |
| 10000              | 3,7ms                          |
| 50000              | 26,8ms                         |

Visto que o sistema espera um número máximo de 1500 alunos em escolas estaduais. Não chega a ser um problema a comparação de força bruta feita atualmente

---

## Método de comparação facial

Foi decidido utilizar cálculo de **similaridade de cossenos** nos vetores faciais por ser menos sensível a iluminação e distância do rosto para a câmera, como era o método de
**distância euclidiana** anterior. Embora a biblioteca do face-api.js disponibilize função nativa para comparação, houve conflito de versões entre o NodeJs e a dependência na tentativa
de implementação no backend. Por isso, a fórmula foi escrita manualmente no service.
