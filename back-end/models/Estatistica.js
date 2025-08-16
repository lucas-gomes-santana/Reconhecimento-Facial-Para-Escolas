const mongoose = require('mongoose');

const EstatisticaSchema = new mongoose.Schema({
    totalCadastros: {
        type: Number,
        default: 0
    },
    totalVerificacoes: {
        type: Number,
        default: 0
    },
    ultimaAtualizacao: {
        type: Date,
        default: Date.now
    }
});

// Garantir que só existe um documento de estatísticas
EstatisticaSchema.statics.getInstance = async function() {
    let estatistica = await this.findOne();
    if (!estatistica) {
        estatistica = await this.create({});
    }
    return estatistica;
};

EstatisticaSchema.statics.incrementarCadastros = async function() {
    const estatistica = await this.getInstance();
    estatistica.totalCadastros += 1;
    estatistica.ultimaAtualizacao = new Date();
    await estatistica.save();
    return estatistica;
};

EstatisticaSchema.statics.incrementarVerificacoes = async function() {
    const estatistica = await this.getInstance();
    estatistica.totalVerificacoes += 1;
    estatistica.ultimaAtualizacao = new Date();
    await estatistica.save();
    return estatistica;
};

module.exports = mongoose.model('Estatistica', EstatisticaSchema);