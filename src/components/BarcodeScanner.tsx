import React, { useState, useRef, useEffect } from 'react';
import { X, Scan, Camera, Flashlight, FlashlightOff, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { foodDatabaseService } from '../services/foodDatabaseService';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodFound: (food: any) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onFoodFound }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsScanning(true);
      startBarcodeDetection();
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'torch' in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          console.error('Flash toggle error:', err);
        }
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  const startBarcodeDetection = () => {
    const detectBarcode = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0) {
        requestAnimationFrame(detectBarcode);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Simulate barcode detection (in real app, use a library like QuaggaJS or ZXing)
      if (Math.random() < 0.1) { // 10% chance to "detect" a barcode
        const mockBarcodes = [
          '123456789012', '234567890123', '345678901234', '456789012345',
          '567890123456', '678901234567', '789012345678', '890123456789'
        ];
        const detectedBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
        handleBarcodeDetected(detectedBarcode);
        return;
      }

      if (isScanning) {
        requestAnimationFrame(detectBarcode);
      }
    };

    requestAnimationFrame(detectBarcode);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setScanResult(barcode);
    
    try {
      const food = await foodDatabaseService.getFoodByBarcode(barcode);
      if (food) {
        onFoodFound(food);
        onClose();
      } else {
        setError(`Product not found for barcode: ${barcode}`);
        setTimeout(() => {
          setScanResult(null);
          setIsProcessing(false);
        }, 3000);
      }
    } catch (err) {
      setError('Failed to lookup product');
      setTimeout(() => {
        setScanResult(null);
        setIsProcessing(false);
      }, 3000);
    }
  };

  const manualBarcodeEntry = () => {
    const barcode = prompt('Enter barcode manually:');
    if (barcode) {
      handleBarcodeDetected(barcode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-2 rounded-full">
            <Scan className="h-5 w-5 text-gray-800" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Barcode Scanner</h3>
            <p className="text-gray-300 text-sm">Point camera at barcode</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFlash}
            className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
          >
            {flashEnabled ? <FlashlightOff className="h-5 w-5" /> : <Flashlight className="h-5 w-5" />}
          </button>
          <button
            onClick={switchCamera}
            className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button 
            onClick={onClose}
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
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Scanner Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={startCamera}
                  className="block w-full bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={manualBarcodeEntry}
                  className="block w-full bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                >
                  Enter Barcode Manually
                </button>
              </div>
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
            
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-64 h-40 border-2 border-white border-dashed rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500"></div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-0.5 bg-green-500 animate-pulse"></div>
                  </div>

                  {/* Success indicator */}
                  {scanResult && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-green-500 p-2 rounded-full">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center mt-4">
                  {isProcessing ? (
                    <div>
                      <p className="text-white font-medium">Processing barcode...</p>
                      <p className="text-gray-300 text-sm">{scanResult}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-medium">Position barcode in frame</p>
                      <p className="text-gray-300 text-sm">Scanning automatically...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-50 p-6">
        <div className="flex justify-center space-x-4">
          <button
            onClick={manualBarcodeEntry}
            className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <span>Enter Manually</span>
          </button>
          
          <button
            onClick={() => handleBarcodeDetected('123456789012')}
            className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Scan className="h-5 w-5" />
            <span>Simulate Scan</span>
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-white text-sm opacity-75">
            💡 Tip: Ensure good lighting and hold steady for best results
          </p>
        </div>
      </div>
    </div>
  );
};