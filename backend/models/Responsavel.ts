import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IResponsavel extends Document {
  nomeCompleto: string;
  parentesco: "Pai" | "Mãe" | "Tio / Tia" | "Avô / Avó" | "Outro";
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  createdAt: Date;
  updatedAt: Date;
}

const responsavelSchema = new Schema<IResponsavel>(
  {
    nomeCompleto: {
      type: String,
      required: [true, "Nome completo é obrigatório!"],
      trim: true,
    },
    parentesco: {
      type: String,
      enum: {
        values: ["Pai", "Mãe", "Tio / Tia", "Avô / Avó", "Outro"],
      },
      required: [true, "Parentesco do responsável é obrigatório!"],
      trim: true,
    },
    cpf: {
      type: String,
      required: [true, "CPF é obrigatório"],
      unique: true,
      trim: true,
    },
    telefone: {
      type: String,
      required: [true, "Telefone é obrigatório"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    senha: {
      type: String,
      required: [true, "Senha é obrigatória!"],
      minlength: [8, "Senha deve ter pelo menos 8 caracteres!"],
    },
  },
  { timestamps: true },
);

responsavelSchema.pre("save", async function (next) {
  if (this.isModified("senha") && this.senha) {
    this.senha = await bcrypt.hash(this.senha, 12);
  }
  next();
});

responsavelSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.senha;
  return obj;
};

const Responsavel: Model<IResponsavel> = mongoose.model<IResponsavel>(
  "Responsavel",
  responsavelSchema,
);
export default Responsavel;
