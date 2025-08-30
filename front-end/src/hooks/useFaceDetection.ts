import { useState, useRef, useCallback, useEffect } from 'react';
import * as faceapi from 'face-api.js';

interface DistanceConfig {
  minFaceSize: number;
  maxFaceSize: number;
  idealMinSize: number;
  idealMaxSize: number;
}

interface DistanceResult {
  status: 'muito_longe' | 'longe' | 'ideal' | 'perto' | 'muito_perto' | 'sem_face';
  isIdeal: boolean;
  faceSize?: number;
}

export const useFaceDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentDescriptor, setCurrentDescriptor] = useState<number[] | null>(null);
  const [isAtIdealDistance, setIsAtIdealDistance] = useState(false);
  const [distanceStatus, setDistanceStatus] = useState<DistanceResult>({
    status: 'sem_face',
    isIdeal: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Removido: const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // O useEffect gerenciará o intervalo agora.

  const distanceConfig: DistanceConfig = {
    minFaceSize: 150,
    maxFaceSize: 350,
    idealMinSize: 180,
    idealMaxSize: 280
  };

  // Carrega os modelos do face-api.js (sem alterações)
  const loadModels = useCallback(async () => {
    if (modelsLoaded) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Iniciando carregamento dos modelos...');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      setModelsLoaded(true);
      console.log('Modelos carregados com sucesso');
    } catch (err) {
      const errorMsg = 'Erro ao carregar modelos de reconhecimento facial: ' + (err instanceof Error ? err.message : 'Erro desconhecido');
      setError(errorMsg);
      console.error('Erro detalhado:', err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [modelsLoaded]);

  // Configura o canvas (sem alterações)
  const setupCanvas = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;
    canvasRef.current.width = videoRef.current.videoWidth || 640;
    canvasRef.current.height = videoRef.current.videoHeight || 480;
  }, []);

  // Inicia o vídeo da câmera (sem alterações)
  const startVideo = useCallback(async () => {
    if (!videoRef.current) {
      throw new Error('Elemento de vídeo não encontrado');
    }
    try {
      setIsVideoLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      return new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Elemento de vídeo não encontrado'));
          return;
        }
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              console.log('Vídeo iniciado com sucesso');
              setupCanvas();
              const checkVideoReady = () => {
                if (videoRef.current && videoRef.current.readyState >= 3) { // Use readyState >= 3 for more reliability
                  setVideoReady(true);
                  setIsVideoLoading(false);
                  console.log('Vídeo pronto para detecção');
                  resolve();
                } else {
                  setTimeout(checkVideoReady, 100);
                }
              };
              checkVideoReady();
            })
            .catch(err => {
              console.warn('Autoplay bloqueado:', err);
              setIsVideoLoading(false);
              resolve();
            });
        };
      });
    } catch (err) {
      const errorMsg = 'Erro ao acessar câmera. Verifique as permissões.';
      setError(errorMsg);
      setIsVideoLoading(false);
      console.error(errorMsg, err);
      throw new Error(errorMsg);
    }
  }, [setupCanvas]);

  // Lógica de cálculo e desenho (sem alterações)
  const calculateDistance = useCallback((detection: any): DistanceResult => {
    const faceBox = detection.detection.box;
    const faceSize = Math.sqrt(faceBox.width * faceBox.height);
    let status: DistanceResult['status'];
    let isIdeal = false;
    if (faceSize < distanceConfig.minFaceSize) status = 'muito_longe';
    else if (faceSize > distanceConfig.maxFaceSize) status = 'muito_perto';
    else if (faceSize >= distanceConfig.idealMinSize && faceSize <= distanceConfig.idealMaxSize) {
      status = 'ideal';
      isIdeal = true;
    } else if (faceSize < distanceConfig.idealMinSize) status = 'longe';
    else status = 'perto';
    return { status, isIdeal, faceSize: Math.round(faceSize) };
  }, [distanceConfig]);

  const drawDistanceIndicator = useCallback((ctx: CanvasRenderingContext2D, distance: DistanceResult, detection: any) => {
    const { status } = distance;
    const faceBox = detection.detection.box;
    const colors = { 'muito_longe': '#ff4444', 'longe': '#ff8844', 'ideal': '#44ff44', 'perto': '#ff8844', 'muito_perto': '#ff4444' };
    const messages = { 'muito_longe': 'Aproxime-se mais', 'longe': 'Um pouco mais perto', 'ideal': 'Distância ideal!', 'perto': 'Afaste-se um pouco', 'muito_perto': 'Muito perto, afaste-se' };
    const color = colors[status];
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(faceBox.x, faceBox.y, faceBox.width, faceBox.height);
    ctx.fillStyle = color;
    ctx.font = '16px Arial';
    ctx.fillText(messages[status], faceBox.x, faceBox.y - 10);
  }, []);

  // Função de detecção de face
  const detectFace = useCallback(async () => {
    // As verificações de `isDetecting` e `videoReady` agora são feitas no useEffect que cria o intervalo
    if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (detections.length === 0) {
        setDistanceStatus({ status: 'sem_face', isIdeal: false });
        setCurrentDescriptor(null);
        setIsAtIdealDistance(false);
        return;
      }

      const detection = detections[0];
      const distance = calculateDistance(detection);
      
      setDistanceStatus(distance);
      setIsAtIdealDistance(distance.isIdeal);
      drawDistanceIndicator(ctx, distance, detection);

      if (distance.isIdeal) {
        setCurrentDescriptor(Array.from(detection.descriptor));
      } else {
        setCurrentDescriptor(null);
      }
    } catch (err) {
      console.error('Erro na detecção:', err);
    }
  }, [calculateDistance, drawDistanceIndicator]);

  // MUDANÇA PRINCIPAL: useEffect para gerenciar o intervalo de detecção
  useEffect(() => {
    // Só inicia o intervalo se a detecção estiver ativa e o vídeo pronto
    if (!isDetecting || !videoReady) {
      return;
    }

    const intervalId = setInterval(() => {
      detectFace();
    }, 300);

    // Função de limpeza: para o intervalo quando o componente desmontar
    // ou quando isDetecting/videoReady se tornarem falsos.
    return () => {
      clearInterval(intervalId);
    };
  }, [isDetecting, videoReady, detectFace]); // Dependências corretas

  // Função para iniciar a detecção (simplificada)
  const startDetection = useCallback(async () => {
    if (isDetecting) return;

    try {
      if (!modelsLoaded) {
        await loadModels();
      }
      setVideoReady(false);
      await startVideo();
      // Apenas ativa o estado. O useEffect acima cuidará de iniciar o intervalo.
      setIsDetecting(true);
      setError(null);
    } catch (err) {
      console.error('Erro ao iniciar detecção:', err);
      setIsDetecting(false); // Garante que não fique em estado de detecção em caso de erro
      throw err;
    }
  }, [isDetecting, modelsLoaded, loadModels, startVideo]);

  // Função para parar a detecção (com melhoria)
  const stopDetection = useCallback(() => {
    // Apenas desativa o estado. O useEffect cuidará de limpar o intervalo.
    setIsDetecting(false);
    setVideoReady(false);

    // MELHORIA: Para a trilha de vídeo para desligar a luz da câmera
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    setIsAtIdealDistance(false);
    setCurrentDescriptor(null);
  }, []);

  // O restante do hook permanece o mesmo...
  const aguardarDescriptor = useCallback((timeout: number = 15000): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const verificarDescriptor = () => {
        if (currentDescriptor && currentDescriptor.length > 0 && isAtIdealDistance) {
          resolve(currentDescriptor);
          return;
        }
        if (Date.now() - startTime > timeout) {
          reject(new Error('Tempo esgotado: não foi possível capturar o rosto na distância ideal.'));
          return;
        }
        setTimeout(verificarDescriptor, 200);
      };
      verificarDescriptor();
    });
  }, [currentDescriptor, isAtIdealDistance]);

  return {
    videoRef,
    canvasRef,
    isDetecting,
    modelsLoaded,
    currentDescriptor,
    isAtIdealDistance,
    distanceStatus,
    loading,
    error,
    videoReady,
    isVideoLoading,
    loadModels,
    startDetection,
    stopDetection,
    aguardarDescriptor,
    getDescriptor: () => isAtIdealDistance ? currentDescriptor : null,
    isAtCorrectDistance: () => isAtIdealDistance
  };
};
