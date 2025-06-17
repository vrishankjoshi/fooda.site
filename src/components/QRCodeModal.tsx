import React, { useState, useEffect } from 'react';
import { X, Smartphone, QrCode, Copy, Check } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface QRCodeModalProps {
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [mobileUrl, setMobileUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate mobile-optimized URL
    const currentUrl = window.location.origin;
    const mobileAnalysisUrl = `${currentUrl}?mode=mobile-camera`;
    setMobileUrl(mobileAnalysisUrl);

    // Generate QR code
    QRCodeLib.toDataURL(mobileAnalysisUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(url => {
      setQrCodeUrl(url);
    }).catch(err => {
      console.error('QR Code generation error:', err);
    });
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Use Your Phone Camera</h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            For the best experience capturing nutrition labels, scan this QR code with your phone to access the camera directly.
          </p>
          
          {/* QR Code */}
          {qrCodeUrl && (
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-6 inline-block">
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
          )}
          
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
              How to use:
            </h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Open your phone's camera app</li>
              <li>Point it at the QR code above</li>
              <li>Tap the notification that appears</li>
              <li>Use your phone to capture the nutrition label</li>
            </ol>
          </div>
          
          {/* Manual URL */}
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or copy this link to your phone:
            </label>
            <div className="flex">
              <input
                type="text"
                value={mobileUrl}
                readOnly
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-r-lg hover:shadow-lg transition-all duration-200 flex items-center"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-sm mt-1">Link copied to clipboard!</p>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-6 bg-gray-500 text-white py-3 rounded-full font-semibold hover:bg-gray-600 transition-colors"
          >
            Continue on Computer
          </button>
        </div>
      </div>
    </div>
  );
};