import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Zap, BarChart3, Star, Users, Award, Utensils, Clock, Lightbulb } from 'lucide-react';

interface MealPhotoAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MealAnalysis {
  mealName: string;
  totalCalories: number;
  totalVishScore: number;
  components: {
    name: string;
    calories: number;
    vishScore: number;
    portion: string;
  }[];
  nutritionSummary: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  healthInsights: string[];
  improvements: string[];
}

export const MealPhotoAnalyzer: React.FC<MealPhotoAnalyzerProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Camera access denied. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
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
        const imageData = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock analysis results
    const mockAnalysis: MealAnalysis = {
      mealName: 'Mixed Plate Dinner',
      totalCalories: 680,
      totalVishScore: 72,
      components: [
        { name: 'Grilled Chicken Breast', calories: 280, vishScore: 78, portion: '6 oz' },
        { name: 'Steamed Broccoli', calories: 55, vishScore: 92, portion: '1 cup' },
        { name: 'Brown Rice', calories: 220, vishScore: 68, portion: '1 cup' },
        { name: 'Mixed Green Salad', calories: 45, vishScore: 88, portion: '2 cups' },
        { name: 'Olive Oil Dressing', calories: 80, vishScore: 65, portion: '1 tbsp' }
      ],
      nutritionSummary: {
        protein: 45,
        carbs: 58,
        fat: 18,
        fiber: 12,
        sodium: 420
      },
      healthInsights: [
        'Excellent protein content for muscle maintenance',
        'Good fiber intake from vegetables and brown rice',
        'Well-balanced macronutrient distribution',
        'Low sodium content supports heart health'
      ],
      improvements: [
        'Consider adding more colorful vegetables for antioxidants',
        'Try quinoa instead of brown rice for complete protein',
        'Add nuts or seeds for healthy omega-3 fats'
      ]
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
    setActiveTab('results');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Utensils className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Meal Photo Analyzer</h2>
                <p className="text-orange-100">AI-powered complete meal analysis</p>
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
                  : 'border-transparent text-orange-200 hover:text-white'
              }`}
            >
              📸 Upload Photo
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'results'
                  ? 'border-white text-white'
                  : 'border-transparent text-orange-200 hover:text-white'
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
              {/* Upload Options */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Camera Capture */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-blue-600" />
                    Take Photo
                  </h3>
                  
                  {!isCameraActive ? (
                    <div className="text-center">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-8 rounded-lg mb-4">
                        <Camera className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Capture your meal with camera
                        </p>
                      </div>
                      <button
                        onClick={startCamera}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Start Camera
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={capturePhoto}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Capture
                        </button>
                        <button
                          onClick={stopCamera}
                          className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-green-600" />
                    Upload Photo
                  </h3>
                  
                  <div className="text-center">
                    <div className="bg-green-100 dark:bg-green-900/20 p-8 rounded-lg mb-4 border-2 border-dashed border-green-300 dark:border-green-600">
                      <Upload className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Choose a photo from your device
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        JPG, PNG up to 10MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
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
                    Selected Photo
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <img
                        src={selectedImage}
                        alt="Selected meal"
                        className="w-full rounded-lg shadow-md"
                      />
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center">
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            🤖 AI Analysis Ready
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Our AI will identify individual food items, estimate portions, 
                            and calculate comprehensive nutrition and Vish Scores.
                          </p>
                        </div>
                        
                        <button
                          onClick={analyzeMeal}
                          disabled={isAnalyzing}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Analyzing Meal...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="h-5 w-5" />
                              <span>Analyze Meal</span>
                            </>
                          )}
                        </button>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Choose Different
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {activeTab === 'results' && analysis && (
            <div className="space-y-6">
              {/* Overall Meal Score */}
              <div className={`${getScoreBackground(analysis.totalVishScore)} rounded-lg p-6`}>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {analysis.mealName}
                  </h3>
                  <div className="flex items-center justify-center space-x-8 mb-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysis.totalVishScore)}`}>
                        {analysis.totalVishScore}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Meal Vish Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {analysis.totalCalories}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Calories</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meal Components */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-orange-600" />
                  Identified Food Items
                </h4>
                <div className="space-y-3">
                  {analysis.components.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {component.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {component.portion} • {component.calories} calories
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(component.vishScore)}`}>
                        {component.vishScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition Summary */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                  Nutrition Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(analysis.nutritionSummary).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {value}g
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {key === 'carbs' ? 'Carbohydrates' : key}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-green-600" />
                    Health Insights
                  </h4>
                  <ul className="space-y-2">
                    {analysis.healthInsights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                    Improvement Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setSelectedImage(null);
                    setAnalysis(null);
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Analyze Another Meal
                </button>
                <button
                  onClick={() => {
                    // Save to meal history
                    alert('Meal analysis saved to your history!');
                  }}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save to History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};