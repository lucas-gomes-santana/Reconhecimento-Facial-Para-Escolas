import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAdmin extends Document {
  nome: string;
  senha: string;
  funcao: "admin" | "seguranca" | "super-admin" | "desenvolvedor";
  ativo: boolean;
  ultimoLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  dataCadastro: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    nome: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
      unique: true,
    },
    senha: {
      type: String,
      required: [true, "Senha é obrigatória"],
      minlength: [8, "Senha deve ter no mínimo 8 caracteres"],
    },
    funcao: {
      type: String,
      required: [true, "Função é obrigatória"],
      enum: {
        values: ["admin", "seguranca", "super-admin", "desenvolvedor"],
        message: 'Função deve ser "admin", "seguranca", "super-admin" ou "desenvolvedor"',
      },
      lowercase: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    ultimoLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Índice para melhorar performance na busca por nome
AdminSchema.index({ nome: 1 });

// Garantir que só exista um usuário do tipo "desenvolvedor" e "super-admin" no banco de dados
AdminSchema.index(
  { funcao: 1 },
  {
    unique: true,
    partialFilterExpression: {
      funcao: { $in: ["desenvolvedor", "super-admin"] },
    },
  },
);

// Middleware para não retornar senha nas consultas por padrão
AdminSchema.methods.toJSON = function () {
  const adminObject = this.toObject();
  delete adminObject.senha;
  return adminObject;
};

// Virtual para padronizar dataCadastro como createdAt
AdminSchema.virtual("dataCadastro").get(function () {
  return this.createdAt;
});

// Garantir que virtuals sejam incluídos na serialização JSON
AdminSchema.set("toJSON", { virtuals: true });

const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", AdminSchema);
export default Admin;
