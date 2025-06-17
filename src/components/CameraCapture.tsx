import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, Smartphone, Monitor } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions or use file upload instead.');
      console.error('Camera access error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageUrl);
      }
    }, 'image/jpeg', 0.8);
  }, []);

  const confirmCapture = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'nutrition-label.jpg', { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
        onClose();
      }
    }, 'image/jpeg', 0.8);
  }, [onCapture, onClose, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-2 rounded-full">
            <Camera className="h-5 w-5 text-gray-800" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Capture Nutrition Label</h3>
            <p className="text-gray-300 text-sm">
              {isMobile ? 'Position label in frame' : 'Use your phone for better results'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center p-8">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Camera Access Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold"
              >
                Use File Upload Instead
              </button>
            </div>
          </div>
        ) : capturedImage ? (
          <div className="h-full flex items-center justify-center bg-black">
            <img 
              src={capturedImage} 
              alt="Captured nutrition label" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-full relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white">Starting camera...</p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Camera overlay guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white border-dashed rounded-lg w-80 h-60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Monitor className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Position nutrition label here</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-50 p-6">
        {capturedImage ? (
          <div className="flex justify-center space-x-4">
            <button
              onClick={retakePhoto}
              className="bg-gray-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-700 transition-colors flex items-center"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </button>
            <button
              onClick={confirmCapture}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <Check className="h-5 w-5 mr-2" />
              Use Photo
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={capturePhoto}
              disabled={isLoading || !!error}
              className="bg-white text-gray-900 p-4 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="h-8 w-8" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile optimization hint */}
      {!isMobile && (
        <div className="absolute top-20 left-4 right-4 bg-blue-600 text-white p-3 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span className="text-sm">For best results, scan the QR code with your phone to use the mobile camera</span>
          </div>
        </div>
      )}
    </div>
  );
};