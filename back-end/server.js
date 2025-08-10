const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/facedb', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    tipoUsuario: { type: String, required: true },
    descriptor: { 
        type: [Number], 
        required: true,
        index: '2dsphere'
    },
    dataCadastro: { type: Date, default: Date.now }
});

// Middleware para verificar rosto duplicado
async function verificarRostoExistente(descriptor) {
    const point = { type: 'Point', coordinates: descriptor };
    const usuarioExistente = await Usuario.findOne({
        descriptor: {
            $near: {
                $geometry: point,
                $maxDistance: 0.6
            }
        }
    });
    return usuarioExistente;
}

app.post('/api/usuarios', async (req, res) => {
    try {
        const { nome, tipoUsuario, descriptor } = req.body;
        
        if (!nome || !tipoUsuario || !descriptor) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        const rostoExistente = await verificarRostoExistente(descriptor);
        if (rostoExistente) {
            return res.status(409).json({ 
                error: 'Rosto já cadastrado',
                usuarioExistente: rostoExistente.nome
            });
        }

        const novoUsuario = new Usuario({ nome, tipoUsuario, descriptor });
        await novoUsuario.save();
        
        res.status(201).json({ 
            success: true,
            usuario: {
                id: novoUsuario._id,
                nome: novoUsuario.nome,
                tipo: novoUsuario.tipoUsuario,
                data: novoUsuario.dataCadastro
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));