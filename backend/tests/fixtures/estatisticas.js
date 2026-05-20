export const estatisticaMock = {
  _id: "807f1f77bcf86cd799439011",
  totalVerificacoes: 100,
  totalEntradas: 50,
  totalSaidas: 30,
  totalMerendas: 20,
  ultimaAtualizacao: new Date("2025-06-01"),
  save: () => Promise.resolve(true),
};

export const estatisticaZerada = {
  _id: "807f1f77bcf86cd799439011",
  totalVerificacoes: 0,
  totalEntradas: 0,
  totalSaidas: 0,
  totalMerendas: 0,
  ultimaAtualizacao: new Date("2025-01-01"),
  save: () => Promise.resolve(true),
};
