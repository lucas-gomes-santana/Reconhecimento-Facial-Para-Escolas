class FaceRecognizer {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.isDetecting = false;
        this.currentDescriptor = null;
        this.detectionInterval = null;
        this.SIMILARITY_THRESHOLD = 0.9;
        this.modelsLoaded = false;
    }

    // Inicializa o reconhecedor com elementos do DOM
    init(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        console.log('FaceRecognizer inicializado');
    }

    // Carrega todos os modelos necessários do face-api.js
    async loadModels() {
        if (this.modelsLoaded) return;
        
        console.log('Carregando modelos...');
        try {
            // Carrega apenas os modelos essenciais para consistência
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('../models')
            ]);
            
            this.modelsLoaded = true;
            console.log('Modelos carregados com sucesso');
            
            // Inicia o vídeo após carregar os modelos
            await this.startVideo();
            
        } catch (error) {
            console.error('Erro ao carregar modelos:', error);
            throw error;
        }
    }

    // Inicia a captura de vídeo da câmera
    async startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480 
                } 
            });
            
            this.video.srcObject = stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play()
                        .then(() => {
                            console.log('Vídeo iniciado com sucesso');
                            this.setupCanvas();
                            resolve();
                        })
                        .catch(err => {
                            console.warn('Autoplay bloqueado:', err);
                            resolve(); // Resolve mesmo assim
                        });
                };
            });
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            throw error;
        }
    }

    // Configura o canvas para desenhar sobre o vídeo
    setupCanvas() {
        if (!this.canvas || !this.video) return;

        // Ajusta o canvas para o tamanho do vídeo
        this.canvas.width = this.video.videoWidth || 640;
        this.canvas.height = this.video.videoHeight || 480;
        
        // Posiciona o canvas sobre o vídeo
        const videoRect = this.video.getBoundingClientRect();
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
    }

    // Inicia a detecção facial contínua
    async startDetection() {
        if (!this.modelsLoaded) {
            throw new Error('Modelos não foram carregados');
        }

        if (this.isDetecting) {
            console.log('Detecção já está em andamento');
            return;
        }

        this.isDetecting = true;
        this.currentDescriptor = null;
        console.log('Iniciando detecção facial...');

        this.detectionInterval = setInterval(async () => {
            await this.detectFace();
        }, 300); // Detecção a cada 300ms
    }

    // Para a detecção facial
    stopDetection() {
        this.isDetecting = false;
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        // Limpa o canvas
        if (this.canvas) {
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        console.log('Detecção parada');
    }

    // Detecta faces no frame atual
    async detectFace() {
        if (!this.video || !this.isDetecting) return;

        try {
            // Usa configurações idênticas ao cadastro original
            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            // Limpa o canvas
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (detections.length > 0) {
                // Redimensiona as detecções para o tamanho do canvas
                const displaySize = { 
                    width: this.canvas.width, 
                    height: this.canvas.height 
                };
                
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                
                // Desenha as detecções no canvas
                faceapi.draw.drawDetections(this.canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);

                // Armazena o descritor da primeira face detectada
                this.currentDescriptor = Array.from(detections[0].descriptor);
                
                console.log('Face detectada - Descritor:', this.currentDescriptor.length, 'dimensões');
            } else {
                this.currentDescriptor = null;
            }

        } catch (error) {
            console.error('Erro na detecção:', error);
        }
    }

    // Retorna o descritor facial atual
    getDescriptor() {
        return this.currentDescriptor;
    }

    // Função para cadastro (mantendo compatibilidade com código existente)
    setCadastroData(nome, tipoUsuario) {
        this.cadastroData = { nome, tipoUsuario };
    }

    // Salva descritor facial para cadastro
    async saveFaceDescriptor() {
        if (!this.currentDescriptor || !this.cadastroData) {
            console.log('Dados insuficientes para cadastro');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...this.cadastroData,
                    descriptor: this.currentDescriptor
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('Cadastro realizado:', result);
                alert(`Usuário ${this.cadastroData.nome} cadastrado com sucesso!`);
                return result;
            } else {
                throw new Error(result.message || 'Erro no cadastro');
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert('Erro ao cadastrar: ' + error.message);
            throw error;
        }
    }
}

// Cria uma instância global
window.FaceRecognition = new FaceRecognizer();