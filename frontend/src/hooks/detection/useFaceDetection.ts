/* eslint-disable react-hooks/exhaustive-deps */
import * as faceapi from 'face-api.js';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { DistanceResult, DistanceConfig, ExpressionStatus} from '../../types/distance.types';


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
  const [expressionStatus, setExpressionStatus] = useState<ExpressionStatus>({
    expression: 'unknown',
    isNeutral: false,
    confidence: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distanceConfig: DistanceConfig = {
    minFaceSize: 150,
    maxFaceSize: 350,
    idealMinSize: 180,
    idealMaxSize: 280
  };

  const loadModels = useCallback(async () => {
    if (modelsLoaded) return;
    setLoading(true);
    setError(null);

    try {
      console.log('Iniciando carregamento dos modelos...');

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]);
      
      setModelsLoaded(true);
      console.log('Modelos carregados com sucesso');

    } catch (err) {
      const errorMsg = 'Erro ao carregar modelos de reconhecimento facial: ' + (err instanceof Error ? err.message : 'Erro desconhecido');
      setError(errorMsg);
      console.error('Erro ao carregar modelos de reconhecimento facial:', err);
      throw new Error(errorMsg);

    } finally {
      setLoading(false);
    }
  }, [modelsLoaded]);

  const setupCanvas = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;
    canvasRef.current.width = videoRef.current.videoWidth || 640;
    canvasRef.current.height = videoRef.current.videoHeight || 480;
  }, []);

  const startVideo = useCallback(async () => {
    if (!videoRef.current) {
      const errorMsg = 'Elemento de vídeo não encontrado. Aguarde o componente carregar.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setIsVideoLoading(true);
      console.log('Solicitando acesso à câmera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });

      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error('Elemento de vídeo foi desmontado durante a inicialização');
      }

      videoRef.current.srcObject = stream;

      return new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Elemento de vídeo não encontrado'));
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout ao iniciar vídeo'));
        }, 10000);

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
            .then(() => {
              console.log('Vídeo iniciado com sucesso');
              setupCanvas();

              const checkVideoReady = () => {
                if (videoRef.current && videoRef.current.readyState >= 3) {
                  clearTimeout(timeoutId);
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
              clearTimeout(timeoutId);
              console.warn('Autoplay bloqueado:', err);
              setIsVideoLoading(false);
              reject(err);
            });
        };

        videoRef.current.onerror = (error: any) => {
          clearTimeout(timeoutId);
          setIsVideoLoading(false);
          reject(new Error('Erro ao carregar stream de vídeo: ', error));
        };
      });
    } catch (err) {
      const errorMsg = err instanceof Error && err.message.includes('Permission denied') 
        ? 'Permissão de câmera negada. Por favor, permita o acesso à câmera.'
        : 'Erro ao acessar câmera. Verifique as permissões e se a câmera está disponível.';
      
      setError(errorMsg);
      setIsVideoLoading(false);
      console.error('Erro ao iniciar vídeo:', err);
      throw new Error(errorMsg);
    }
  }, [setupCanvas]);

  // Lógica de cálculo e desenho 
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
    } 

    else if (faceSize < distanceConfig.idealMinSize) status = 'longe';
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

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions(); 

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (detections.length === 0) {
        setDistanceStatus({ status: 'sem_face', isIdeal: false });
        setCurrentDescriptor(null);
        setIsAtIdealDistance(false);
        setExpressionStatus({ expression: 'desconhecida', isNeutral: false, confidence: 0 });
        return;
      }

      const detection = detections[0];
      const distance = calculateDistance(detection);
      const expression = analyzeExpression(detection.expressions);
      
      setDistanceStatus(distance);
      setExpressionStatus(expression);
      
      const canCapture = distance.isIdeal && expression.isNeutral;
      setIsAtIdealDistance(canCapture);
      
      drawDistanceIndicator(ctx, distance, detection);
      drawExpressionIndicator(ctx, expression, detection);

      if (canCapture) {
        setCurrentDescriptor(Array.from(detection.descriptor));
      } else {
        setCurrentDescriptor(null);
      }
    } catch (err) {
      console.error('Erro na detecção:', err);
    }
  }, [calculateDistance]);

  const drawExpressionIndicator = useCallback((
    ctx: CanvasRenderingContext2D, 
    expression: ExpressionStatus, 
    detection: any
  ) => {
    const faceBox = detection.detection.box;
    const color = expression.isNeutral ? '#44ff44' : '#ff8844';
    
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(
      `Expressão: ${expression.expression}`, 
      faceBox.x, 
      faceBox.y + faceBox.height + 20
    );
    
  if (!expression.isNeutral) {
    ctx.fillStyle = '#ff8844';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(
      'Mantenha uma expressão neutra!', 
      faceBox.x, 
      faceBox.y + faceBox.height + 40
    );
  }
}, []);


  // useEffect para gerenciar o intervalo de detecção
  useEffect(() => {
    if (!isDetecting || !videoReady) {
      return;
    }

    const intervalId = setInterval(() => {
      detectFace();
    }, 300);

    return () => {
      clearInterval(intervalId);
    };
  }, [isDetecting, videoReady, detectFace]);
  
  const startDetection = useCallback(async () => {
    if (isDetecting) {
      console.log('Detecção já está em andamento');
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      const errorMsg = 'Elementos de vídeo ou canvas não estão prontos. Aguarde o componente carregar.';
      setError(errorMsg);
      console.error(errorMsg);
      return;
    }

    try {
      console.log('Iniciando processo de detecção...');
      
      if (!modelsLoaded) {
        console.log('Carregando modelos...');
        await loadModels();
      }

      setVideoReady(false);
      setError(null);
      
      console.log('Iniciando vídeo...');
      await startVideo();
      
      setIsDetecting(true);
      console.log('Detecção iniciada com sucesso');

    } catch (err) {
      console.error('Erro ao iniciar detecção:', err);
      setIsDetecting(false);
      
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao iniciar detecção';
      setError(errorMsg);
    }
  }, [isDetecting, modelsLoaded, loadModels, startVideo]);

  const analyzeExpression = useCallback((expressions: any): ExpressionStatus => {
    // Encontra a expressão com maior confiança
    const expressionsArray = Object.entries(expressions) as [string, number][];
    const [dominantExpression, confidence] = expressionsArray.reduce((max, curr) => 
      curr[1] > max[1] ? curr : max
    );
    
    const isNeutral = dominantExpression === 'neutral' && confidence >= 0.6;
    
    const translatedExpressions: Record<string, string> = {
      'neutral': 'neutra',
      'happy': 'feliz',
      'sad': 'triste',
      'angry': 'raiva',
      'fearful': 'medo',
      'disgusted': 'desgosto',
      'surprised': 'surpreso'
    };

    return {
      expression: translatedExpressions[dominantExpression] || dominantExpression,
      isNeutral,
      confidence: Math.round(confidence * 100)
    };
  }, []);

  const stopDetection = useCallback(() => {
    console.log('Parando detecção...');
    setIsDetecting(false);
    setVideoReady(false);

    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    setIsAtIdealDistance(false);
    setCurrentDescriptor(null);
    setError(null);
    console.log('Detecção parada');
  }, []);

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
    expressionStatus,
    loadModels,
    startDetection,
    stopDetection,
    aguardarDescriptor,
    getDescriptor: () => isAtIdealDistance ? currentDescriptor : null,
    isAtCorrectDistance: () => isAtIdealDistance,
  };
}