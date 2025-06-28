import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertTriangle, Star, BarChart3, Heart, Smartphone, QrCode, Users, TrendingUp, Award } from 'lucide-react';
import { analyzeNutritionLabel, NutritionAnalysis } from '../services/visionService';
import { CameraCapture } from './CameraCapture';
import { QRCodeModal } from './QRCodeModal';
import { VishScoreDisplay } from './VishScoreDisplay';
import { NutritionAnalysisPanel } from './NutritionAnalysisPanel';
import { TasteAnalysisPanel } from './TasteAnalysisPanel';
import { ConsumerRatingsPanel } from './ConsumerRatingsPanel';

interface VisionAnalysisProps {
  onClose: () => void;
  onCameraAnalysis?: (analysis: NutritionAnalysis) => void;
}

export const VisionAnalysis: React.FC<VisionAnalysisProps> = ({ onClose, onCameraAnalysis }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [userHealthInfo, setUserHealthInfo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'taste' | 'consumer'>('overview');

  // Check if opened via QR code for mobile camera mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'mobile-camera') {
      setIsMobileMode(true);
      setShowCamera(true);
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleCameraCapture = async (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowCamera(false);
    setError(null);

    // Automatically analyze the captured image and go to chatbot
    setIsAnalyzing(true);
    try {
      const result = await analyzeNutritionLabel(file, userHealthInfo);
      if (onCameraAnalysis) {
        onCameraAnalysis(result);
        onClose();
      } else {
        setAnalysis(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeNutritionLabel(selectedFile, userHealthInfo);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Show camera directly on mobile mode
  if (showCamera) {
    return (
      <CameraCapture 
        onCapture={handleCameraCapture}
        onClose={() => {
          setShowCamera(false);
          if (isMobileMode) {
            // Close the entire modal if opened via QR code
            onClose();
          }
        }}
      />
    );
  }

  // Show loading screen when analyzing camera capture
  if (isAnalyzing && selectedFile && !analysis) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 transition-colors duration-300">
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analyzing Your Food</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our AI is examining the nutrition label and preparing a comprehensive Vish Score analysis...
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ⚡ Analyzing nutrition, taste, and consumer data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Vision Analysis</h2>
                <p className="text-green-100">Upload a nutrition label for comprehensive Vish Score analysis</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!analysis ? (
            <div className="p-6">
              {/* Health Info Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Information (Optional)
                </label>
                <textarea
                  value={userHealthInfo}
                  onChange={(e) => setUserHealthInfo(e.target.value)}
                  placeholder="Tell us about any health conditions (diabetes, allergies, heart conditions, etc.) for personalized analysis..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  rows={3}
                />
              </div>

              {/* Camera Options */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setShowCamera(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex flex-col items-center"
                >
                  <Camera className="h-8 w-8 mb-2" />
                  <span className="font-semibold">Use Camera</span>
                  <span className="text-sm opacity-90">Take photo now</span>
                </button>
                
                {!isMobile && (
                  <button
                    onClick={() => setShowQRCode(true)}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex flex-col items-center"
                  >
                    <QrCode className="h-8 w-8 mb-2" />
                    <span className="font-semibold">Phone Camera</span>
                    <span className="text-sm opacity-90">Scan QR code</span>
                  </button>
                )}
                
                <label className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex flex-col items-center cursor-pointer">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="font-semibold">Upload File</span>
                  <span className="text-sm opacity-90">Choose from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors"
              >
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <div className="flex justify-center space-x-4">
                      <label className="bg-gray-500 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-gray-600 transition-colors">
                        Choose Different Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Get Vish Score
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">Drag and drop an image here</p>
                      <p className="text-gray-600 dark:text-gray-400">Or use one of the options above</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Analysis Results */
            <div className="h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'overview'
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>Vish Score Overview</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('nutrition')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'nutrition'
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Nutrition Analysis</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('taste')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'taste'
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4" />
                      <span>Taste Analysis</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('consumer')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'consumer'
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Consumer Ratings</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <VishScoreDisplay
                      nutritionScore={analysis.overall.nutritionScore}
                      tasteScore={analysis.overall.tasteScore}
                      consumerScore={analysis.overall.consumerScore}
                      vishScore={analysis.overall.vishScore}
                      grade={analysis.overall.grade}
                    />
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Overall Summary</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {analysis.overall.summary}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'nutrition' && (
                  <NutritionAnalysisPanel
                    nutrition={analysis.nutrition}
                    health={analysis.health}
                  />
                )}

                {activeTab === 'taste' && (
                  <TasteAnalysisPanel
                    taste={analysis.taste}
                  />
                )}

                {activeTab === 'consumer' && (
                  <ConsumerRatingsPanel
                    rating={analysis.consumer}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setAnalysis(null);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setError(null);
                      setActiveTab('overview');
                    }}
                    className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    Analyze Another
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && <QRCodeModal onClose={() => setShowQRCode(false)} />}
    </div>
  );
};