import mongoose, { mongo } from "mongoose";


const AdminSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    senha: {type: String, required: true},
    funcao: {type: String, required: true}
});

export default mongoose.model('Admin', AdminSchema);