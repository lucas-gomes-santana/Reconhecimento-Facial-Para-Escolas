import mongoose from 'mongoose';


const UsuarioSchema = new mongoose.Schema({
    nome: {type: String, required: true, unique: true},
    tipoUsuario: {type: String, required: true},
    descriptor: {type: [Number], required: true},
    dataCadastro: {type: Date, default: Date.now},
    status: {type: String, enum:['liberado', 'bloqueado'], default: 'liberado'},
    bloqueadoAte: {type: Date, default: null},
}, {
  timestamps: true
});

export default mongoose.model('Usuario', UsuarioSchema);
