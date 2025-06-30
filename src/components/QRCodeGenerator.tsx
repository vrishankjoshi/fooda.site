import React, { useState, useEffect } from 'react';
import { X, QrCode, Download, Share2, Smartphone } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ isOpen, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const url = window.location.href;
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'foodcheck-qr-code.png';
      link.click();
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], 'foodcheck-qr.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'FoodCheck - AI Food Analysis',
          text: 'Scan this QR code to access FoodCheck on your mobile device!',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 transition-colors duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-full">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mobile Access</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scan to open on mobile</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* QR Code */}
        <div className="text-center mb-6">
          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-md inline-block">
              <img 
                src={qrCodeUrl} 
                alt="QR Code for FoodCheck" 
                className="w-64 h-64"
              />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
            How to use:
          </h3>
          <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>1. Open your phone's camera app</li>
            <li>2. Point it at the QR code above</li>
            <li>3. Tap the notification to open FoodCheck</li>
            <li>4. Start analyzing food on your mobile device!</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={downloadQRCode}
            disabled={!qrCodeUrl}
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          
          <button
            onClick={shareQRCode}
            disabled={!qrCodeUrl || !navigator.share}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 <strong>Mobile Benefits:</strong> Camera access, touch interface, and on-the-go food analysis
          </p>
        </div>
      </div>
    </div>
  );
};