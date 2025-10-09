import React from 'react';

interface VideoCanvasDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isDetecting: boolean;
  distanceStatus?: {
    status: string;
    isIdeal: boolean;
  };
  videoReady?: boolean;
  showDistanceIndicator?: boolean;
  getDistanceMessage?: (status: string) => string;
  className?: string;
}

const VideoCanvasDetector: React.FC<VideoCanvasDetectorProps> = ({
  videoRef,
  canvasRef,
  isDetecting,
  distanceStatus,
  videoReady = true,
  showDistanceIndicator = true,
  getDistanceMessage,
  className = ''
}) => {
  const getBorderColor = () => {
    if (!isDetecting) return 'border-gray-300';
    if (distanceStatus?.isIdeal) return 'border-green-500';
    if (distanceStatus?.status === 'sem_face') return 'border-red-500';
  };

  const getIndicatorStyle = () => {
    if (distanceStatus?.isIdeal) {
      return 'bg-green-300 text-green-800 border border-green-300';
    }
    return 'bg-red-300 text-red-800 border border-yellow-300';
  };

  return (
    <div className={`relative mx-auto my-5 w-full max-w-2xl h-96 md:h-[480px] ${className}`}>
      <video 
        ref={videoRef}
        width="640" 
        height="480" 
        autoPlay 
        muted 
        playsInline
        className={`absolute top-0 left-0 w-full h-full rounded-lg border-4 object-cover transition-colors duration-300 ${getBorderColor()} ${
          !videoReady ? 'opacity-0' : 'opacity-100'
        } transition-opacity`}
      />
      
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
      />
      
      {!videoReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
          <div className="text-gray-600">Carregando câmera...</div>
        </div>
      )}
      
      {isDetecting && showDistanceIndicator && distanceStatus && getDistanceMessage && (
        <div className="absolute top-4 left-4 right-4">
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getIndicatorStyle()}`}>
            {getDistanceMessage(distanceStatus.status)}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCanvasDetector;