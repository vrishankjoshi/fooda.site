import React, { useState, useRef, useCallback } from 'react';
import { X, Camera, Upload, Zap, BarChart3, Star, Users, Award, AlertTriangle, CheckCircle, Download, Share2, Heart, Eye, Loader2 } from 'lucide-react';
import { analyzeNutritionLabel } from '../services/visionService';
import { VishScoreDisplay } from './VishScoreDisplay';
import { NutritionAnalysisPanel } from './NutritionAnalysisPanel';
import { TasteAnalysisPanel } from './TasteAnalysisPanel';
import { ConsumerRatingsPanel } from './ConsumerRatingsPanel';
import { analysisService } from '../services/analysisService';

interface AIVisionAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete?: (analysis: any) => void;
}

export const AIVisionAnalysis: React.FC<AIVisionAnalysisProps> = ({ 
  isOpen, 
  onClose, 
  onAnalysisComplete 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const [healthInfo, setHealthInfo] = useState('');
  const [foodName, setFoodName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Camera access denied. Please use file upload instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            handleFileSelect(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setShowCamera(false);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeNutritionLabel(selectedFile, healthInfo);
      setAnalysis(result);
      setActiveTab('results');
      
      // Save to history
      analysisService.saveAnalysis({
        foodName: foodName || result.nutrition?.name || 'Unknown Food',
        analysis: result,
        imageUrl: selectedImage || undefined
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again with a clearer image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setAnalysis(null);
    setActiveTab('upload');
    setHealthInfo('');
    setFoodName('');
    stopCamera();
  };

  const shareAnalysis = () => {
    if (analysis && navigator.share) {
      navigator.share({
        title: `${foodName || 'Food'} Analysis - Vish Score: ${analysis.overall?.vishScore || 'N/A'}`,
        text: `Check out this food analysis from FoodCheck! Vish Score: ${analysis.overall?.vishScore || 'N/A'}/100`,
        url: window.location.href
      });
    }
  };

  const downloadReport = () => {
    if (analysis) {
      const report = {
        foodName: foodName || 'Unknown Food',
        timestamp: new Date().toISOString(),
        vishScore: analysis.overall?.vishScore,
        nutrition: analysis.nutrition,
        health: analysis.health,
        taste: analysis.taste,
        consumer: analysis.consumer
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${foodName || 'food'}-analysis.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Vision Analysis</h2>
                <p className="text-green-100">Instant nutrition label analysis with Vish Score</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-6 mt-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'border-white text-white'
                  : 'border-transparent text-green-200 hover:text-white'
              }`}
            >
              📸 Upload & Analyze
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'results'
                  ? 'border-white text-white'
                  : 'border-transparent text-green-200 hover:text-white'
              }`}
              disabled={!analysis}
            >
              📊 Analysis Results
            </button>
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-160px)]">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {!showCamera ? (
                <>
                  {/* Upload Options */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Camera Capture */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Camera className="h-5 w-5 mr-2 text-blue-600" />
                        Take Photo
                      </h3>
                      <div className="text-center">
                        <div className="bg-blue-100 dark:bg-blue-900/20 p-8 rounded-lg mb-4">
                          <Camera className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                          <p className="text-gray-600 dark:text-gray-400">
                            Capture nutrition label with camera
                          </p>
                        </div>
                        <button
                          onClick={startCamera}
                          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Start Camera
                        </button>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Upload className="h-5 w-5 mr-2 text-green-600" />
                        Upload Image
                      </h3>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDragging
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Drag & drop an image here, or click to select
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          JPG, PNG up to 10MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Choose File
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Selected Image Preview */}
                  {selectedImage && (
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Selected Image
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <img
                            src={selectedImage}
                            alt="Selected nutrition label"
                            className="w-full rounded-lg shadow-md max-h-80 object-contain"
                          />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Food Name (Optional)
                            </label>
                            <input
                              type="text"
                              value={foodName}
                              onChange={(e) => setFoodName(e.target.value)}
                              placeholder="e.g., Organic Granola Bar"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Health Information (Optional)
                            </label>
                            <textarea
                              value={healthInfo}
                              onChange={(e) => setHealthInfo(e.target.value)}
                              placeholder="e.g., I have diabetes and high blood pressure"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                              rows={3}
                            />
                          </div>

                          <button
                            onClick={analyzeImage}
                            disabled={isAnalyzing}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="h-5 w-5" />
                                <span>Analyze with AI</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={resetAnalysis}
                            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Choose Different Image
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Camera Interface */
                <div className="space-y-4">
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-96 object-cover"
                    />
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={capturePhoto}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Capture</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && analysis && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {foodName || analysis.nutrition?.name || 'Food Analysis'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Comprehensive Vish Score Analysis
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={shareAnalysis}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={downloadReport}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Vish Score Display */}
              <VishScoreDisplay
                nutritionScore={analysis.health?.score || 0}
                tasteScore={analysis.taste?.score || 0}
                consumerScore={analysis.consumer?.score || 0}
                vishScore={analysis.overall?.vishScore || 0}
                grade={analysis.overall?.grade || 'N/A'}
              />

              {/* Analysis Panels */}
              <div className="grid gap-6">
                {analysis.nutrition && analysis.health && (
                  <NutritionAnalysisPanel
                    nutrition={analysis.nutrition}
                    health={analysis.health}
                  />
                )}

                {analysis.taste && (
                  <TasteAnalysisPanel taste={analysis.taste} />
                )}

                {analysis.consumer && (
                  <ConsumerRatingsPanel rating={analysis.consumer} />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={resetAnalysis}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Analyze Another Food
                </button>
                <button
                  onClick={() => {
                    // Save to favorites
                    const favorites = JSON.parse(localStorage.getItem('foodcheck_favorites') || '[]');
                    const newFavorite = {
                      id: Date.now().toString(),
                      name: foodName || 'Unknown Food',
                      vishScore: analysis.overall?.vishScore || 0,
                      timestamp: new Date().toISOString()
                    };
                    favorites.push(newFavorite);
                    localStorage.setItem('foodcheck_favorites', JSON.stringify(favorites));
                    alert('Added to favorites!');
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Heart className="h-5 w-5" />
                  <span>Add to Favorites</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};