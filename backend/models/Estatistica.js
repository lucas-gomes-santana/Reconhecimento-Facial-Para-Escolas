import mongoose from "mongoose";

const EstatisticaSchema = new mongoose.Schema({
  totalVerificacoes: {
    type: Number,
    default: 0,
  },
  totalEntradas: {
    type: Number,
    default: 0,
  },
  totalSaidas: {
    type: Number,
    default: 0,
  },
  totalMerendas: {
    type: Number,
    default: 0,
  },
  ultimaAtualizacao: {
    type: Date,
    default: Date.now,
  },
});

// Garantir que só existe um documento de estatísticas
EstatisticaSchema.statics.getInstance = async function () {
  let estatistica = await this.findOne();

  if (!estatistica) {
    estatistica = await this.create({});
  }

  return estatistica;
};

EstatisticaSchema.statics.incrementarVerificacoes = async function () {
  const estatistica = await this.getInstance();
  estatistica.totalVerificacoes += 1;
  estatistica.ultimaAtualizacao = new Date();
  await estatistica.save();
  return estatistica;
};

EstatisticaSchema.statics.incrementarEntrada = async function () {
  const estatistica = await this.getInstance();
  estatistica.totalEntradas += 1;
  estatistica.ultimaAtualizacao = new Date();
  await estatistica.save();
  return estatistica;
};

// EstatisticaSchema.statics.incrementarSaida = async function () {
//   const estatistica = await this.getInstance();
//   estatistica.totalSaidas += 1;
//   estatistica.ultimaAtualizacao = new Date();
//   await estatistica.save();
//   return estatistica;
// };

EstatisticaSchema.statics.incrementarMerenda = async function () {
  const estatistica = await this.getInstance();
  estatistica.totalMerendas += 1;
  estatistica.ultimaAtualizacao = new Date();
  await estatistica.save();
  return estatistica;
};

export default mongoose.model("Estatistica", EstatisticaSchema);
