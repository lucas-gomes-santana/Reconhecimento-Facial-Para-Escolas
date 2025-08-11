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
        required: true
    },
    dataCadastro: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Função para calcular distância euclidiana entre dois descritores
function calcularDistanciaEuclidiana(descriptor1, descriptor2) {
    if (descriptor1.length !== descriptor2.length) {
        return Infinity;
    }
    
    let soma = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        soma += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    
    return Math.sqrt(soma);
}

// Função para encontrar usuário por similaridade facial
async function encontrarUsuarioPorSimilaridade(descriptorBusca, threshold = 0.6) {
    try {
        // Busca todos os usuários cadastrados
        const usuarios = await Usuario.find({});
        
        let melhorMatch = null;
        let menorDistancia = Infinity;
        
        // Compara com cada usuário cadastrado
        for (const usuario of usuarios) {
            const distancia = calcularDistanciaEuclidiana(descriptorBusca, usuario.descriptor);
            
            console.log(`Comparando com ${usuario.nome}: distância = ${distancia.toFixed(4)}`);
            
            // Se a distância é menor que o threshold e é a menor encontrada
            if (distancia < threshold && distancia < menorDistancia) {
                menorDistancia = distancia;
                melhorMatch = {
                    usuario,
                    distancia,
                    similaridade: Math.max(0, 1 - (distancia / threshold)) // Converte distância para similaridade (0-1)
                };
            }
        }
        
        return melhorMatch;
        
    } catch (err) {
        console.error('Erro na busca por similaridade:', err);
        throw err;
    }
}

// Middleware para verificar rosto duplicado (para cadastro)
async function verificarRostoExistente(descriptor, threshold = 0.4) {
    const match = await encontrarUsuarioPorSimilaridade(descriptor, threshold);
    return match ? match.usuario : null;
}

// Rota para cadastrar usuário
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nome, tipoUsuario, descriptor } = req.body;
        
        if (!nome || !tipoUsuario || !descriptor) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        // Verifica se já existe um rosto similar (threshold mais restritivo para cadastro)
        const rostoExistente = await verificarRostoExistente(descriptor, 0.4);
        if (rostoExistente) {
            return res.status(409).json({ 
                error: 'Rosto já cadastrado',
                usuarioExistente: rostoExistente.nome
            });
        }

        const novoUsuario = new Usuario({ nome, tipoUsuario, descriptor });
        await novoUsuario.save();
        
        console.log(`Usuário ${nome} cadastrado com sucesso`);
        
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
        console.error('Erro no cadastro:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para verificação de rosto
app.post('/api/verificar-rosto', async (req, res) => {
    try {
        const { descriptor } = req.body;
        
        if (!descriptor || !Array.isArray(descriptor)) {
            return res.status(400).json({ error: 'Descritor facial não fornecido ou inválido' });
        }

        console.log('Iniciando verificação facial...');
        
        // Busca por similaridade com threshold mais flexível para verificação
        const match = await encontrarUsuarioPorSimilaridade(descriptor, 0.6);
        
        if (match) {
            console.log(`Usuário encontrado: ${match.usuario.nome} (distância: ${match.distancia.toFixed(4)}, similaridade: ${(match.similaridade * 100).toFixed(1)}%)`);
            
            return res.json({ 
                encontrado: true,
                usuario: {
                    nome: match.usuario.nome,
                    tipoUsuario: match.usuario.tipoUsuario,
                    dataCadastro: match.usuario.dataCadastro
                },
                similaridade: match.similaridade,
                distancia: match.distancia
            });
        } else {
            console.log('Nenhum usuário similar encontrado');
            return res.json({ encontrado: false });
        }
        
    } catch (err) {
        console.error('Erro na verificação:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para listar todos os usuários (útil para debug)
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, { descriptor: 0 }); // Exclui o descriptor da resposta
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para deletar usuário (útil para testes)
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
    console.log('Sistema de reconhecimento facial inicializado');
});