import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    nome: {
        type: String, 
        required: [true, 'Nome é obrigatório'],
        trim: true,
    },
    senha: {
        type: String, 
        required: [true, 'Senha é obrigatória'],
        minlength: [8, 'Senha deve ter no mínimo 8 caracteres']
    },
    funcao: {
        type: String, 
        required: [true, 'Função é obrigatória'],
        enum: {
            values: ['admin', 'seguranca'],
            message: 'Função deve ser "admin" ou "seguranca"'
        },
        lowercase: true
    },
    dataCadastro: { // ✅ Campo explícito
        type: Date,
        default: Date.now
    },
    ativo: {
        type: Boolean,
        default: true
    },
    ultimoLogin: {
        type: Date,
        default: null
    }
});

// Índice para melhorar performance na busca por nome
AdminSchema.index({ nome: 1 });

// Middleware para não retornar senha nas consultas por padrão
AdminSchema.methods.toJSON = function() {
    const adminObject = this.toObject();
    delete adminObject.senha;
    return adminObject;
};

export default mongoose.model('Admin', AdminSchema);