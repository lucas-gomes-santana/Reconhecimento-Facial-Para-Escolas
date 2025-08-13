const mongoose = require('mongoose');

class DatabaseConfig {
    
    async connect() {
        try {
            await mongoose.connect('mongodb://localhost:27017/facedb', { 
                useNewUrlParser: true, 
                useUnifiedTopology: true 
            });
            console.log('Conectado ao MongoDB');
        } catch (error) {
            console.error('Erro ao conectar com o MongoDB:', error);
            process.exit(1);
        }
    }
}

module.exports = new DatabaseConfig();