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

const Usuario = mongoose.model('Usuario', UsuarioSchema);

Usuario.createIndexes().then(() => {
  console.log('Índices criados com sucesso');
}).catch(err => {
  console.error('Erro ao criar índices:', err);
})

// Middleware para verificar rosto duplicado
async function verificarRostoExistente(descriptor) {
  try {
    return await Usuario.findOne({
      descriptor: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: descriptor
          },
          $maxDistance: 0.9
        }
      }
    });
  } catch (err) {
    console.error('Erro na consulta:', err);
    throw err;
  }
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

// Nova rota para verificação
app.post('/api/verificar-rosto', async (req, res) => {
    try {
        const { descriptor } = req.body;
        
        if (!descriptor) {
            return res.status(400).json({ error: 'Descritor facial não fornecido' });
        }

        const usuarioExistente = await verificarRostoExistente(descriptor);
        
        if (usuarioExistente) {
            return res.json({ 
                encontrado: true,
                usuario: {
                    nome: usuarioExistente.nome,
                    tipoUsuario: usuarioExistente.tipoUsuario,
                    dataCadastro: usuarioExistente.dataCadastro
                }
            });
        } else {
            return res.json({ encontrado: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));