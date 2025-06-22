import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertTriangle, Star, BarChart3, Heart, Smartphone, QrCode, Users, TrendingUp } from 'lucide-react';
import { analyzeNutritionLabel, NutritionAnalysis } from '../services/visionService';
import { CameraCapture } from './CameraCapture';
import { QRCodeModal } from './QRCodeModal';

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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'B': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'C': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'D': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'F': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
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

        <div className="p-6">
          {!analysis ? (
            <>
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
            </>
          ) : (
            /* Analysis Results */
            <div className="space-y-6">
              {/* Overall Grade and Vish Score */}
              <div className="text-center">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${getGradeColor(analysis.overall.grade)} mb-4`}>
                  Overall Grade: {analysis.overall.grade}
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-xl font-bold inline-block mb-4">
                  Vish Score: {analysis.overall.vishScore}/100
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{analysis.overall.summary}</p>
              </div>

              {/* Three Pillar Scores */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Nutrition</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.health.score)}`}>
                    {analysis.health.score}/100
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Health Impact</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <Star className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Taste</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.taste.score)}`}>
                    {analysis.taste.score}/100
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Flavor Quality</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Consumer</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.consumer.score)}`}>
                    {analysis.consumer.score}/100
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">User Satisfaction</p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nutrition Facts */}
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Nutrition Facts
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Calories:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Fat:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.totalFat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Sodium:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.sodium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Carbs:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.totalCarbohydrates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Protein:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{analysis.nutrition.protein}</span>
                    </div>
                  </div>
                </div>

                {/* Consumer Insights */}
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Consumer Insights
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Satisfaction:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-2">{analysis.consumer.satisfaction}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Feedback:</span>
                      <p className="text-gray-900 dark:text-white mt-1">{analysis.consumer.feedback}</p>
                    </div>
                    {analysis.consumer.positiveAspects.length > 0 && (
                      <div>
                        <span className="text-green-600 dark:text-green-400 font-medium">👍 Liked:</span>
                        <ul className="mt-1 space-y-1">
                          {analysis.consumer.positiveAspects.slice(0, 2).map((aspect, index) => (
                            <li key={index} className="text-xs text-gray-700 dark:text-gray-300">• {aspect}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Warnings */}
              {analysis.health.warnings.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                    Health Warnings
                  </h4>
                  <ul className="space-y-2">
                    {analysis.health.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                        <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.health.recommendations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {analysis.health.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Taste Profile */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Taste Profile
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{analysis.taste.description}</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.taste.profile.map((trait, index) => (
                    <span key={index} className="bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full text-xs">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4">
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setError(null);
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
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && <QRCodeModal onClose={() => setShowQRCode(false)} />}
    </div>
  );
};