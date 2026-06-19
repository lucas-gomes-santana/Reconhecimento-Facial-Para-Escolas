import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAlunoMatricula extends Document {
  matricula: string;
  cpf: string;
  nomeCompleto: string;
  turma: string;
  turno: "Matutino" | "Vespertino" | "Noturno";
  usuarioId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const AlunoMatriculaSchema = new Schema<IAlunoMatricula>(
  {
    matricula: {
      type: String,
      required: [true, "Matrícula é obrigatória!"],
      unique: true,
      trim: true,
    },
    cpf: {
      type: String,
      required: [true, "CPF é obrigatório!"],
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
  },
  { timestamps: true },
);

const AlunoMatricula: Model<IAlunoMatricula> = mongoose.model<IAlunoMatricula>(
  "AlunoMatricula",
  AlunoMatriculaSchema,
);
export default AlunoMatricula;
