import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center space-x-3">
        {isOnline ? (
          <>
            <CheckCircle className="h-5 w-5" />
            <div>
              <div className="font-semibold">Back Online!</div>
              <div className="text-sm opacity-90">All features available</div>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <div>
              <div className="font-semibold">You're Offline</div>
              <div className="text-sm opacity-90">Some features may be limited</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};