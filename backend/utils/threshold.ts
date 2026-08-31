/* Esta constante define um percentual mínimo de 96% de similaridade para definir
que um rosto escaneado no frontend é o mesmo de um rosto do banco de dados após todos os
vetores faciais serem comparados. Se após todas as verificações nenhuma comparação bate esse
percentual, o sistema entende que o rosto escaneado não existe no banco*/

export const threshold = 0.96;
