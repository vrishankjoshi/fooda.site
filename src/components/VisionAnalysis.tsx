import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertTriangle, Star, BarChart3, Heart, Smartphone, QrCode } from 'lucide-react';
import { analyzeNutritionLabel, NutritionAnalysis } from '../services/visionService';
import { CameraCapture } from './CameraCapture';
import { QRCodeModal } from './QRCodeModal';

interface VisionAnalysisProps {
  onClose: () => void;
}

export const VisionAnalysis: React.FC<VisionAnalysisProps> = ({ onClose }) => {
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

  const handleCameraCapture = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowCamera(false);
    setError(null);
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
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Vision Analysis</h2>
                <p className="text-green-100">Upload a nutrition label for instant analysis</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Information (Optional)
                </label>
                <textarea
                  value={userHealthInfo}
                  onChange={(e) => setUserHealthInfo(e.target.value)}
                  placeholder="Tell us about any health conditions (diabetes, allergies, heart conditions, etc.) for personalized analysis..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors"
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
                            Analyze Label
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Drag and drop an image here</p>
                      <p className="text-gray-600">Or use one of the options above</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Analysis Results */
            <div className="space-y-6">
              {/* Overall Grade */}
              <div className="text-center">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${getGradeColor(analysis.overall.grade)}`}>
                  Overall Grade: {analysis.overall.grade}
                </div>
                <p className="text-gray-600 mt-2">{analysis.overall.summary}</p>
              </div>

              {/* Scores */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Nutrition</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.health.score)}`}>
                    {analysis.health.score}/100
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Taste</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.taste.score)}`}>
                    {analysis.taste.score}/100
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Health</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.health.score)}`}>
                    {analysis.health.score}/100
                  </p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nutrition Facts */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Nutrition Facts
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span className="font-medium">{analysis.nutrition.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Fat:</span>
                      <span className="font-medium">{analysis.nutrition.totalFat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sodium:</span>
                      <span className="font-medium">{analysis.nutrition.sodium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Carbs:</span>
                      <span className="font-medium">{analysis.nutrition.totalCarbohydrates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span className="font-medium">{analysis.nutrition.protein}</span>
                    </div>
                  </div>
                </div>

                {/* Health Warnings */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Health Warnings
                  </h4>
                  {analysis.health.warnings.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.health.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-700 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      No major health concerns identified
                    </p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {analysis.health.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {analysis.health.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Taste Profile */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600" />
                  Taste Profile
                </h4>
                <p className="text-sm text-gray-700 mb-2">{analysis.taste.description}</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.taste.profile.map((trait, index) => (
                    <span key={index} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
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