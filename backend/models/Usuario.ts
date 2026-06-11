import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUsuario extends Document {
  nome: string;
  tipoUsuario: string;
  descriptor: number[];
  dataCadastro: Date;
  status: "liberado" | "bloqueado";
  bloqueadoAte: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nome: { type: String, required: true, unique: true },
    tipoUsuario: { type: String, required: true },
    descriptor: { type: [Number], required: true },
    dataCadastro: { type: Date, default: Date.now },
    status: { type: String, enum: ["liberado", "bloqueado"], default: "liberado" },
    bloqueadoAte: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

const Usuario: Model<IUsuario> = mongoose.model<IUsuario>("Usuario", UsuarioSchema);
export default Usuario;
