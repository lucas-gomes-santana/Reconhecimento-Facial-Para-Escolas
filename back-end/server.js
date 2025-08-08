const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect('mongodb://localhost:27017/facedb', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// Schema com índice para busca por similaridade
const FaceSchema = new mongoose.Schema({
  descriptor: { 
    type: [Number], 
    required: true,
    index: '2dsphere' // Índice especial para cálculos de distância
  },
  timestamp: { type: Date, default: Date.now }
});
const Face = mongoose.model('Face', FaceSchema);

// Função para calcular similaridade
async function isSimilarFaceExists(descriptor) {
  // Converte para o formato GeoJSON necessário para $near
  const point = {
    type: 'Point',
    coordinates: descriptor
  };

  // Busca rostos similares (com distância <= 0.5)
  const similarFace = await Face.findOne({
    descriptor: {
      $near: {
        $geometry: point,
        $maxDistance: 0.6 // Ajuste este valor conforme necessário
      }
    }
  });

  return !!similarFace;
}

// Rota para salvar vetor facial
app.post('/api/faces', async (req, res) => {
  try {
    const { descriptor } = req.body;
    
    // Verifica se já existe um rosto similar
    if (await isSimilarFaceExists(descriptor)) {
      return res.status(200).send('Rosto similar já existe no banco de dados');
    }

    const face = new Face({ descriptor });
    await face.save();
    res.status(201).send('Face salva com sucesso!');
  } catch (err) {
    res.status(500).send('Erro ao salvar face: ' + err.message);
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));