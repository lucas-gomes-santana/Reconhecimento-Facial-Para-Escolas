import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEstatistica extends Document {
  totalVerificacoes: number;
  totalEntradas: number;
  totalSaidas: number;
  totalMerendas: number;
  ultimaAtualizacao: Date;
}

export interface EstatisticaModel extends Model<IEstatistica> {
  getInstance(): Promise<IEstatistica>;
  incrementarVerificacoes(): Promise<IEstatistica>;
  incrementarEntrada(): Promise<IEstatistica>;
  incrementarMerenda(): Promise<IEstatistica>;
}

const EstatisticaSchema = new Schema<IEstatistica, EstatisticaModel>({
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

EstatisticaSchema.statics.incrementarMerenda = async function () {
  const estatistica = await this.getInstance();
  estatistica.totalMerendas += 1;
  estatistica.ultimaAtualizacao = new Date();
  await estatistica.save();
  return estatistica;
};

const Estatistica = mongoose.model<IEstatistica, EstatisticaModel>(
  "Estatistica",
  EstatisticaSchema,
);
export default Estatistica;
