import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, Loader2, Upload } from 'lucide-react';

interface ChatbotCameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isAnalyzing?: boolean;
}

export const ChatbotCamera: React.FC<ChatbotCameraProps> = ({ 
  onCapture, 
  onClose, 
  isAnalyzing = false 
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async (preferredFacingMode: 'user' | 'environment' = 'environment') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: preferredFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      setFacingMode(preferredFacingMode);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      
      // Try fallback to front camera if back camera fails
      if (preferredFacingMode === 'environment') {
        try {
          const fallbackConstraints = {
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };
          
          const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          setStream(fallbackStream);
          setFacingMode('user');
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(console.error);
            };
          }
        } catch (fallbackErr) {
          setError('Camera access denied. Please allow camera permissions or use file upload.');
        }
      } else {
        setError('Camera access denied. Please allow camera permissions or use file upload.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const switchCamera = useCallback(() => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(newFacingMode);
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
  }, []);

  const confirmCapture = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'nutrition-label.jpg', { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCapture(file);
      stopCamera();
    }
  };

  React.useEffect(() => {
    if (!isAnalyzing) {
      startCamera();
    }
    return () => stopCamera();
  }, [isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 transition-colors duration-300">
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analyzing Your Food</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Our AI is examining the nutrition label...
          </p>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              ⚡ This usually takes just a few seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-white" />
            <div>
              <h3 className="text-white font-semibold">Capture Nutrition Label</h3>
              <p className="text-green-100 text-xs">Position the label clearly in frame</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!capturedImage && !error && stream && (
              <button
                onClick={switchCamera}
                className="bg-white bg-opacity-20 text-white p-1.5 rounded-full hover:bg-opacity-30 transition-colors"
                title="Switch Camera"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative" style={{ height: '300px' }}>
        {error ? (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
            <div className="text-center p-4">
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-gray-900 dark:text-white font-medium mb-2">Camera Unavailable</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{error}</p>
              
              {/* File Upload Alternative */}
              <div className="space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center mx-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo Instead
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
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
              <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"></div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Starting camera...</p>
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
                  <div className="border-2 border-white border-dashed rounded-lg bg-black bg-opacity-20 p-4 text-center">
                    <Camera className="h-6 w-6 text-white mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Position nutrition label here</p>
                    <p className="text-white text-xs opacity-75">Make sure text is clear</p>
                  </div>
                </div>

                {/* Camera info */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
                </div>
              </>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        {capturedImage ? (
          <div className="flex justify-center space-x-3">
            <button
              onClick={retakePhoto}
              className="bg-gray-500 text-white px-4 py-2 rounded-full font-medium hover:bg-gray-600 transition-colors flex items-center text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </button>
            <button
              onClick={confirmCapture}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center text-sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Analyze This Photo
            </button>
          </div>
        ) : !error && !isLoading ? (
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-500 text-white px-4 py-2 rounded-full font-medium hover:bg-gray-600 transition-colors flex items-center text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </button>
            <button
              onClick={capturePhoto}
              disabled={!stream}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center text-sm"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : null}
      </div>

      {/* Tips */}
      <div className="px-4 pb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300 text-xs text-center">
            💡 <strong>Tip:</strong> Ensure good lighting and hold steady for best results
          </p>
        </div>
      </div>
    </div>
  );
};