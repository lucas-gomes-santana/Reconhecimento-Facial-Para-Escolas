const video = document.getElementById('video');

// Adicione no início do arquivo:
let lastDescriptor = null;
const SIMILARITY_THRESHOLD = 0.5; // Ajuste conforme necessário (quanto menor, mais sensível)

// Função para calcular distância euclidiana entre descritores
function getDescriptorDistance(desc1, desc2) {
  return faceapi.euclideanDistance(desc1, desc2);
}

// Modifique a função saveFaceDescriptor:
async function saveFaceDescriptor(detections) {
  if (detections.length === 0) return;

  const currentDescriptor = detections[0].descriptor;
  
  // Se não há último descritor ou é significativamente diferente
  if (!lastDescriptor || 
      getDescriptorDistance(lastDescriptor, currentDescriptor) > SIMILARITY_THRESHOLD) {
    
    console.log("Enviando novo descritor facial...");
    lastDescriptor = currentDescriptor;

    try {
      const response = await fetch('http://localhost:3000/api/faces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          descriptor: Array.from(currentDescriptor)
        })
      });
      console.log("Resposta do servidor:", await response.text());
    } catch (err) {
      console.error("Erro ao enviar descritor:", err);
    }
  } else {
    console.log("Rosto similar detectado - não enviando");
  }
}

// 1. Carregar TODOS os modelos necessários
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
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