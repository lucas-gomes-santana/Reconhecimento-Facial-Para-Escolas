class FaceDetectionService {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.isDetecting = false;
        this.currentDescriptor = null;
        this.detectionInterval = null;
        this.modelsLoaded = false;
        this.isAtIdealDistance = false;
        this.distanceCallback = null;
        
        // Configurações de distância baseadas no tamanho da face
        this.distanceConfig = {
            minFaceSize: 150,  // Tamanho mínimo da face (muito longe)
            maxFaceSize: 350,  // Tamanho máximo da face (muito perto)
            idealMinSize: 180, // Tamanho ideal mínimo
            idealMaxSize: 280  // Tamanho ideal máximo
        };
    }

    init(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        console.log('FaceDetectionService inicializado');
    }

    setDistanceCallback(callback) {
        this.distanceCallback = callback;
    }

    async loadModels() {
        if (this.modelsLoaded) return;
        
        console.log('Carregando modelos...');
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('../models')
            ]);
            
            this.modelsLoaded = true;
            console.log('Modelos carregados com sucesso');
            await this.startVideo();
        } catch (error) {
            console.error('Erro ao carregar modelos:', error);
            throw error;
        }
    }

    async startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
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
                            resolve();
                        });
                };
            });
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            throw error;
        }
    }

    setupCanvas() {
        if (!this.canvas || !this.video) return;

        this.canvas.width = this.video.videoWidth || 640;
        this.canvas.height = this.video.videoHeight || 480;
        
        const videoRect = this.video.getBoundingClientRect();
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
    }

    calculateDistance(detection) {
        const faceBox = detection.detection.box;
        const faceSize = Math.sqrt(faceBox.width * faceBox.height);
        
        let status = '';
        let isIdeal = false;
        
        if (faceSize < this.distanceConfig.minFaceSize) {
            status = 'muito_longe';
        } else if (faceSize > this.distanceConfig.maxFaceSize) {
            status = 'muito_perto';
        } else if (faceSize >= this.distanceConfig.idealMinSize && faceSize <= this.distanceConfig.idealMaxSize) {
            status = 'ideal';
            isIdeal = true;
        } else if (faceSize < this.distanceConfig.idealMinSize) {
            status = 'longe';
        } else {
            status = 'perto';
        }
        
        return { status, isIdeal, faceSize: Math.round(faceSize) };
    }

    drawDistanceIndicator(ctx, distance, detection) {
        const { status, faceSize } = distance;
        const faceBox = detection.detection.box;
        
        // Cores para diferentes estados
        const colors = {
            'muito_longe': '#ff4444',
            'longe': '#ff8844',
            'ideal': '#44ff44',
            'perto': '#ff8844',
            'muito_perto': '#ff4444'
        };
        
        // Mensagens para o usuário
        const messages = {
            'muito_longe': 'Aproxime-se mais',
            'longe': 'Um pouco mais perto',
            'ideal': 'Distância ideal!',
            'perto': 'Afaste-se um pouco',
            'muito_perto': 'Muito perto, afaste-se'
        };
        
        const color = colors[status];
        const message = messages[status];
        
        // Desenha o contorno da face com a cor correspondente
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(faceBox.x, faceBox.y, faceBox.width, faceBox.height);
        
        // Desenha a mensagem
        ctx.fillStyle = color;
        ctx.font = '16px Arial';
        ctx.fillText(message, faceBox.x, faceBox.y - 10);
        
        // Desenha indicador de tamanho (para debug, pode remover)
        ctx.font = '12px Arial';
        ctx.fillText(`Tamanho: ${faceSize}px`, faceBox.x, faceBox.y + faceBox.height + 15);
    }

    async startDetection() {
        if (!this.modelsLoaded) {
            throw new Error('Modelos não foram carregados');
        }

        if (this.isDetecting) return;

        this.isDetecting = true;
        this.currentDescriptor = null;
        this.isAtIdealDistance = false;
        console.log('Iniciando detecção facial...');

        this.detectionInterval = setInterval(async () => {
            await this.detectFace();
        }, 300);
    }

    stopDetection() {
        this.isDetecting = false;
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        if (this.canvas) {
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.isAtIdealDistance = false;
        console.log('Detecção parada');
    }

    async detectFace() {
        if (!this.video || !this.isDetecting) return;

        try {
            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (detections.length > 0) {
                const displaySize = { 
                    width: this.canvas.width, 
                    height: this.canvas.height 
                };
                
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                const detection = resizedDetections[0];
                
                // Calcula a distância
                const distance = this.calculateDistance(detections[0]);
                this.isAtIdealDistance = distance.isIdeal;
                
                // Desenha os indicadores visuais
                this.drawDistanceIndicator(ctx, distance, detection);
                
                // Desenha landmarks apenas se estiver na distância ideal
                if (distance.isIdeal) {
                    faceapi.draw.drawFaceLandmarks(this.canvas, [detection]);
                    this.currentDescriptor = Array.from(detections[0].descriptor);
                    console.log('Face detectada na distância ideal - Descritor:', this.currentDescriptor.length, 'dimensões');
                } else {
                    this.currentDescriptor = null;
                }
                
                // Chama callback se definido
                if (this.distanceCallback) {
                    this.distanceCallback(distance);
                }
                
            } else {
                this.currentDescriptor = null;
                this.isAtIdealDistance = false;
                
                // Mostra mensagem quando não detecta face
                ctx.fillStyle = '#888';
                ctx.font = '18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Nenhum rosto detectado', this.canvas.width / 2, this.canvas.height / 2);
                ctx.textAlign = 'left';
                
                if (this.distanceCallback) {
                    this.distanceCallback({ status: 'sem_face', isIdeal: false });
                }
            }
        } catch (error) {
            console.error('Erro na detecção:', error);
        }
    }

    getDescriptor() {
        // Só retorna o descritor se estiver na distância ideal
        return this.isAtIdealDistance ? this.currentDescriptor : null;
    }

    isAtCorrectDistance() {
        return this.isAtIdealDistance;
    }

    async aguardarDescriptor(timeout = 15000, onProgress = null) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let lastStatusUpdate = 0;
            let tentativas = 0;
            
            const verificarDescriptor = () => {
                const descriptor = this.getDescriptor();
                const currentTime = Date.now();
                tentativas++;
                
                if (onProgress && currentTime - lastStatusUpdate > 2000) {
                    const elapsed = Math.floor((currentTime - startTime) / 1000);
                    const remaining = Math.max(0, Math.floor(timeout / 1000) - elapsed);
                    onProgress(remaining, tentativas, this.isAtIdealDistance);
                    lastStatusUpdate = currentTime;
                }
                
                if (descriptor && descriptor.length > 0 && this.isAtIdealDistance) {
                    console.log(`Descritor capturado na distância ideal após ${tentativas} tentativas:`, descriptor.length, 'dimensões');
                    resolve(descriptor);
                    return;
                }

                if (currentTime - startTime > timeout) {
                    reject(new Error('Tempo esgotado: não foi possível capturar o rosto na distância ideal. Posicione-se entre 30cm e 60cm da câmera.'));
                    return;
                }

                setTimeout(verificarDescriptor, 200);
            };

            verificarDescriptor();
        });
    }
}

// Cria uma instância global
window.FaceDetectionService = new FaceDetectionService();