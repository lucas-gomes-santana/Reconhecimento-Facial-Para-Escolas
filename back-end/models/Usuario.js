import mongoose from 'mongoose';


const UsuarioSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    tipoUsuario: {type: String, required: true},
    descriptor: {type: [Number], required: true},
    dataCadastro: {type: Date, default: Date.now}
});

export default mongoose.model('Usuario', UsuarioSchema);
