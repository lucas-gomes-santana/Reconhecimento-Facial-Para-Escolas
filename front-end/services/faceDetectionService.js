class FaceDetectionService {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.isDetecting = false;
        this.currentDescriptor = null;
        this.detectionInterval = null;
        this.modelsLoaded = false;
    }

    init(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        console.log('FaceDetectionService inicializado');
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

    async startDetection() {
        if (!this.modelsLoaded) {
            throw new Error('Modelos não foram carregados');
        }

        if (this.isDetecting) return;

        this.isDetecting = true;
        this.currentDescriptor = null;
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
                
                faceapi.draw.drawDetections(this.canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);

                this.currentDescriptor = Array.from(detections[0].descriptor);
                console.log('Face detectada - Descritor:', this.currentDescriptor.length, 'dimensões');
            } else {
                this.currentDescriptor = null;
            }
        } catch (error) {
            console.error('Erro na detecção:', error);
        }
    }

    getDescriptor() {
        return this.currentDescriptor;
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
                    onProgress(remaining, tentativas);
                    lastStatusUpdate = currentTime;
                }
                
                if (descriptor && descriptor.length > 0) {
                    console.log(`Descritor capturado após ${tentativas} tentativas:`, descriptor.length, 'dimensões');
                    resolve(descriptor);
                    return;
                }

                if (currentTime - startTime > timeout) {
                    reject(new Error('Tempo esgotado: não foi possível detectar um rosto. Certifique-se de que há luz suficiente e que seu rosto está visível.'));
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