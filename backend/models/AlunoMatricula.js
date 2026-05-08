import mongoose, { Schema } from "mongoose";

const AlunoMatriculaSchema = new Schema({
  matricula: {
    type: String,
    required: [true, "Matrícula é obrigatória!"],
    unique: true,
    trim: true,
  },
  nomeCompleto: {
    type: String,
    required: [true, "Nome completo é obrigatório!"],
    trim: true,
  },
  turma: {
    type: String,
    required: [true, "Turma é obrigatória!"],
    trim: true,
  },
  turno: {
    type: String,
    enum: ["Matutino", "Vespertino", "Noturno"],
    required: [true, "Turno é obrigatório!"],
  },
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    default: null,
  },
}, { timestamps: true });

export default mongoose.model("AlunoMatricula", AlunoMatriculaSchema);