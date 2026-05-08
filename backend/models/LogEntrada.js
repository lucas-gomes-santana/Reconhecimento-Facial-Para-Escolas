import mongoose, { Schema } from "mongoose";

const LogEntradaSchema = new Schema({
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
}, { timestamps: true });

LogEntradaSchema.index({ usuarioId: 1, tipo: 1, timestamp: -1 });
LogEntradaSchema.index({ alunoMatriculaId: 1, tipo: 1, timestamp: -1 });
LogEntradaSchema.index({ timestamp: -1 });

export default mongoose.model("LogEntrada", LogEntradaSchema);