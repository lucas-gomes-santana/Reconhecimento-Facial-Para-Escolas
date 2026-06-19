import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ILogEntrada extends Document {
  usuarioId: Types.ObjectId;
  alunoMatriculaId?: Types.ObjectId | null;
  tipo: "entrada" | "saida" | "merenda";
  timestamp: Date;
  similaridade: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const LogEntradaSchema = new Schema<ILogEntrada>(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    alunoMatriculaId: {
      type: Schema.Types.ObjectId,
      ref: "AlunoMatricula",
      default: null,
    },
    tipo: {
      type: String,
      enum: ["entrada", "saida", "merenda"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    similaridade: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

LogEntradaSchema.index({ usuarioId: 1, tipo: 1, timestamp: -1 });
LogEntradaSchema.index({ alunoMatriculaId: 1, tipo: 1, timestamp: -1 });
LogEntradaSchema.index({ timestamp: -1 });

const LogEntrada: Model<ILogEntrada> = mongoose.model<ILogEntrada>(
  "LogEntrada",
  LogEntradaSchema,
);
export default LogEntrada;
