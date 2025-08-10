document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const form = document.getElementById('cadastroForm');
    const nomeInput = document.getElementById('nome');
    const tipoUsuarioSelect = document.getElementById('tipoUsuario');
    const iniciarBtn = document.getElementById('iniciarReconhecimento');
    const salvarBtn = document.getElementById('salvarCadastro');
    const statusElement = document.getElementById('status');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    // Variáveis de estado
    let faceDescriptor = null;
    let isCameraActive = false;
    let detectionInterval;

    // Configuração inicial
    canvas.width = 640;
    canvas.height = 480;
    const displaySize = { width: 640, height: 480 };
    faceapi.matchDimensions(canvas, displaySize);

    // Carrega modelos do face-api.js
    async function loadModels() {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('../models')
            ]);
            console.log('Modelos carregados com sucesso');
        } catch (err) {
            console.error('Erro ao carregar modelos:', err);
            statusElement.textContent = 'Erro ao carregar recursos de reconhecimento';
        }
    }

    // Inicia a câmera
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            video.srcObject = stream;
            await video.play();
            isCameraActive = true;
            return true;
        } catch (err) {
            console.error('Erro na câmera:', err);
            statusElement.textContent = 'Erro ao acessar a câmera';
            return false;
        }
    }

    // Detecta rostos periodicamente
    function startFaceDetection() {
        detectionInterval = setInterval(async () => {
            if (!isCameraActive) return;

            try {
                const detections = await faceapi.detectAllFaces(
                    video, 
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceLandmarks().withFaceDescriptors();

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                
                // Limpa e desenha no canvas
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                if (detections.length > 0) {
                    faceDescriptor = detections[0].descriptor;
                    statusElement.textContent = 'Rosto detectado!';
                    salvarBtn.disabled = false;
                } else {
                    statusElement.textContent = 'Posicione seu rosto na câmera';
                    salvarBtn.disabled = true;
                }
            } catch (err) {
                console.error('Erro na detecção:', err);
            }
        }, 300);
    }

    // Envia dados para o backend
    async function cadastrarUsuario() {
        if (!faceDescriptor || !nomeInput.value || !tipoUsuarioSelect.value) {
            alert('Preencha todos os campos e posicione seu rosto!');
            return;
        }

        try {
            salvarBtn.disabled = true;
            statusElement.textContent = 'Enviando dados...';

            const response = await fetch('http://localhost:3000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nomeInput.value,
                    tipoUsuario: tipoUsuarioSelect.value,
                    descriptor: Array.from(faceDescriptor)
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Usuário ${data.usuario.nome} cadastrado com sucesso!`);
                form.reset();
                statusElement.textContent = 'Pronto para novo cadastro';
            } else {
                throw new Error(data.error || 'Erro no cadastro');
            }
        } catch (err) {
            console.error('Erro:', err);
            alert('Falha no cadastro: ' + err.message);
            statusElement.textContent = 'Erro - Tente novamente';
        } finally {
            salvarBtn.disabled = false;
        }
    }

    // Event Listeners
    iniciarBtn.addEventListener('click', async () => {
        if (!nomeInput.value || !tipoUsuarioSelect.value) {
            alert('Preencha nome e tipo de usuário primeiro!');
            return;
        }

        statusElement.textContent = 'Iniciando câmera...';
        iniciarBtn.disabled = true;

        if (!isCameraActive) {
            const success = await startCamera();
            if (!success) return;
        }

        startFaceDetection();
    });

    salvarBtn.addEventListener('click', cadastrarUsuario);

    // Inicialização
    loadModels();
});