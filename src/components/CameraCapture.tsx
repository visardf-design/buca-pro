import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (data: string, type: 'image' | 'video') => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedMedia({ url: dataUrl, type: 'image' });
        stopCamera();
      }
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setCapturedMedia({ url, type: 'video' });
      stopCamera();
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const handlePointerDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      startRecording();
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    
    if (isRecording) {
      stopRecording();
    } else {
      // If it wasn't a long press, it's a photo
      if (!capturedMedia) {
        takePhoto();
      }
    }
  };

  const retake = () => {
    setCapturedMedia(null);
    startCamera();
  };

  const confirm = () => {
    if (capturedMedia) {
      onCapture(capturedMedia.url, capturedMedia.type);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-zinc-900 overflow-hidden sm:rounded-3xl">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-white mb-4">{error}</p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-white text-black rounded-full font-bold"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            {!capturedMedia ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full font-black text-xs flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    GRAVANDO {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </>
            ) : (
              capturedMedia.type === 'image' ? (
                <img 
                  src={capturedMedia.url} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <video 
                  src={capturedMedia.url} 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover"
                />
              )
            )}
            
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-around bg-gradient-to-t from-black/80 to-transparent">
              {!capturedMedia ? (
                <>
                  <button 
                    onClick={onClose}
                    className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <button 
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 transition-all ${
                      isRecording ? 'bg-red-600 border-red-400 scale-125' : 'bg-white border-white/20'
                    }`}
                  >
                    <div className={`transition-all ${
                      isRecording ? 'w-8 h-8 bg-white rounded-sm' : 'w-16 h-16 bg-white border-2 border-black/10 rounded-full'
                    }`} />
                  </button>
                  <div className="w-14" /> {/* Spacer */}
                </>
              ) : (
                <>
                  <button 
                    onClick={retake}
                    className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white flex flex-col items-center gap-1"
                  >
                    <RotateCcw className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase">Refazer</span>
                  </button>
                  <button 
                    onClick={confirm}
                    className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/40"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white flex flex-col items-center gap-1"
                  >
                    <X className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase">Cancelar</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="mt-8 text-center px-6">
        <h3 className="text-white font-black text-xl mb-2">Câmera em Tempo Real</h3>
        <p className="text-zinc-400 text-sm">
          Toque para foto. Segure para gravar vídeo.
        </p>
      </div>
    </div>
  );
};
