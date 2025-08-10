const video = document.getElementById('video');
let lastDescriptor = null;
const SIMILARITY_THRESHOLD = 0.5;
let cadastroData = {}; // Armazena temporariamente nome e tipo

// Função para configurar dados do formulário
function setCadastroData(nome, tipoUsuario) {
    cadastroData = { nome, tipoUsuario };
}

async function saveFaceDescriptor(detections) {
    if (detections.length === 0 || !cadastroData.nome || !cadastroData.tipoUsuario) return;

    const currentDescriptor = detections[0].descriptor;
    
    if (!lastDescriptor || 
        faceapi.euclideanDistance(lastDescriptor, currentDescriptor) > SIMILARITY_THRESHOLD) {
        
        console.log("Enviando dados para cadastro...");
        lastDescriptor = currentDescriptor;

        try {
            const response = await fetch('http://localhost:3000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...cadastroData,
                    descriptor: Array.from(currentDescriptor)
                })
            });
            
            const result = await response.json();
            if (response.ok) {
                console.log("Cadastro realizado:", result);
                alert(`Usuário ${cadastroData.nome} cadastrado com sucesso!`);
            } else {
                throw new Error(result.message || "Erro no cadastro");
            }
        } catch (err) {
            console.error("Erro:", err);
            alert("Erro ao cadastrar: " + err.message);
        }
    }
}

// 1. Carregar TODOS os modelos necessários
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
  faceapi.nets.faceExpressionNet.loadFromUri('../models')
]).then(startVideo).catch(err => console.error("Erro nos modelos:", err));

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play().catch(err => console.log("Autoplay bloqueado:", err));
      };
    })
    .catch(err => console.error("Erro na câmera:", err));
}

video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    try {
      const detections = await faceapi.detectAllFaces(video, 
        new faceapi.TinyFaceDetectorOptions()
      )
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      
      if (resizedDetections.length > 0) {
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        
        if (resizedDetections[0].expressions) {
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }

        // Envia para o backend após 2 segundos
        setTimeout(() => {
          saveFaceDescriptor(detections);
        }, 3000);
      }

    } catch (err) {
      console.error("Erro na detecção:", err);
    }
  }, 200);
});