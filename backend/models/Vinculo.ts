import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IVinculo extends Document {
  responsavelId: Types.ObjectId;
  alunoMatriculaId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vinculoSchema = new Schema<IVinculo>(
  {
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
  },
  { timestamps: true },
);

vinculoSchema.index(
  { responsavelId: 1, alunoMatriculaId: 1 },
  { unique: true },
);

const Vinculo: Model<IVinculo> = mongoose.model<IVinculo>(
  "Vinculo",
  vinculoSchema,
);
export default Vinculo;
