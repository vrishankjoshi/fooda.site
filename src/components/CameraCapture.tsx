import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, Smartphone, Monitor, Mail } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCameraError, setShowCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          facingMode: preferredFacingMode
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      setFacingMode(preferredFacingMode);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
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
              facingMode: 'user'
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
          setShowCameraError(true);
        }
      } else {
        setShowCameraError(true);
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
        onClose();
      }
    }, 'image/jpeg', 0.9);
  }, [onCapture, onClose, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const handleSendToEmail = () => {
    const subject = encodeURIComponent('Food Analysis Request - Nutrition Label');
    const body = encodeURIComponent(`Hi FoodCheck Team,

I would like to request a food analysis. I will attach a clear photo of the nutrition label.

Please provide a comprehensive analysis including:
- Nutrition breakdown
- Health assessment
- Taste evaluation

Thank you!`);
    
    const mailtoLink = `mailto:vrishankjo@gmail.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
    
    // Close the camera modal
    stopCamera();
    onClose();
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Show camera error modal
  if (showCameraError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Camera className="h-8 w-8 text-red-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Camera Issues</h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Sorry, our camera is having issues. Please try again later.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-700 font-medium mb-2">
                📧 Alternative: Send via Email
              </p>
              <p className="text-xs text-blue-600">
                Get the same comprehensive analysis by emailing your nutrition label photo directly to us.
              </p>
            </div>
            
            <button 
              onClick={handleSendToEmail}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center mb-3"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send to Email
            </button>
            
            <button 
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-full bg-gray-500 text-white py-3 rounded-full font-semibold hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              Position the nutrition facts panel in the frame
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Camera switch button */}
          {!capturedImage && !error && (
            <button
              onClick={switchCamera}
              className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
              title="Switch Camera"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
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
              <p className="text-gray-300 mb-4 max-w-sm">{error}</p>
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
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
                  <div className="border-2 border-white border-dashed rounded-lg w-80 h-60 flex items-center justify-center bg-black bg-opacity-20">
                    <div className="text-center text-white">
                      <Monitor className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Position nutrition label here</p>
                      <p className="text-xs opacity-75 mt-1">Make sure text is clear and readable</p>
                    </div>
                  </div>
                </div>

                {/* Camera info */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
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
              className="bg-white text-gray-900 p-4 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Camera className="h-8 w-8" />
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-black bg-opacity-50 px-4 pb-4">
        <div className="text-center">
          <p className="text-white text-sm opacity-75">
            💡 Tip: Ensure good lighting and hold the camera steady for best results
          </p>
        </div>
      </div>
    </div>
  );
};