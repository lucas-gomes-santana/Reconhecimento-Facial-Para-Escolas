const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MongoDB (substitua pela sua URL)
mongoose.connect('mongodb://localhost:27017/facedb', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// Modelo para armazenar os vetores faciais
const FaceSchema = new mongoose.Schema({
  descriptor: { type: [Number], required: true }, // Array de 128 números
  timestamp: { type: Date, default: Date.now }
});
const Face = mongoose.model('Face', FaceSchema);

// Rota para salvar o vetor facial
app.post('/api/faces', async (req, res) => {
  try {
    const { descriptor } = req.body;
    const face = new Face({ descriptor });
    await face.save();
    res.status(201).send('Face salva com sucesso!');
  } catch (err) {
    res.status(500).send('Erro ao salvar face: ' + err.message);
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));