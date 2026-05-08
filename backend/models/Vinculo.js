import mongoose, { Schema } from "mongoose";

const vinculoSchema = new Schema({
  responsavelId: {
    type: Schema.Types.ObjectId,
    ref: "Responsavel",
    required: [true, "ID do responsável é obrigatório!"],
  },
  alunoMatriculaId: {
    type: Schema.Types.ObjectId,
    ref: "AlunoMatricula",
    required: [true, "ID da matrícula é obrigatório!"],
  },
}, { timestamps: true });

vinculoSchema.index({ responsavelId: 1, alunoMatriculaId: 1 }, { unique: true });

export default mongoose.model("Vinculo", vinculoSchema);