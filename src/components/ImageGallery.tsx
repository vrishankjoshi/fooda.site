import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Heart, Star, BarChart3, Users, Camera, Zap, Beaker, Brain, TrendingUp, Award } from 'lucide-react';

interface ImageItem {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'taste' | 'consumer' | 'general';
  component: React.ReactNode;
  alt: string;
}

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

// Original AI-generated visual components (no copyrighted content)
const AIVisualizationCard: React.FC<{ title: string; icon: React.ReactNode; color: string; data: string[] }> = ({ title, icon, color, data }) => (
  <div className={`w-full h-48 ${color} rounded-lg p-6 flex flex-col justify-between`}>
    <div className="flex items-center space-x-3 text-white">
      {icon}
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-1000"
            style={{ width: `${Math.random() * 80 + 20}%` }}
          />
        </div>
      ))}
    </div>
    <div className="text-white text-sm opacity-90">AI Analysis in Progress...</div>
  </div>
);

const NutritionChart: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg p-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-white bg-opacity-10">
      <div className="grid grid-cols-4 gap-2 p-4 h-full">
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i}
            className="bg-white bg-opacity-30 rounded animate-pulse"
            style={{ 
              height: `${Math.random() * 80 + 20}%`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    </div>
    <div className="relative z-10 text-white">
      <h3 className="text-xl font-bold mb-2">Nutrition Analysis</h3>
      <p className="text-sm opacity-90">Real-time nutritional breakdown</p>
    </div>
  </div>
);

const TasteProfile: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg p-6 relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-32 h-32 border-4 border-white border-opacity-30 rounded-full relative">
        <div className="absolute inset-2 border-2 border-white border-opacity-50 rounded-full">
          <div className="absolute inset-2 border border-white border-opacity-70 rounded-full flex items-center justify-center">
            <Star className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    </div>
    <div className="relative z-10 text-white">
      <h3 className="text-xl font-bold mb-2">Taste Science</h3>
      <p className="text-sm opacity-90">Flavor compound analysis</p>
    </div>
  </div>
);

const ConsumerRating: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg p-6">
    <div className="text-white mb-4">
      <h3 className="text-xl font-bold mb-2">Consumer Insights</h3>
      <p className="text-sm opacity-90">Real user feedback</p>
    </div>
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((stars) => (
        <div key={stars} className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} className="h-3 w-3 text-yellow-300 fill-current" />
            ))}
          </div>
          <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2"
              style={{ width: `${Math.random() * 60 + 20}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AIBrain: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 relative overflow-hidden">
    <div className="absolute inset-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 2 + 1}s`
          }}
        />
      ))}
    </div>
    <div className="relative z-10 text-white">
      <Brain className="h-12 w-12 mb-4" />
      <h3 className="text-xl font-bold mb-2">AI Intelligence</h3>
      <p className="text-sm opacity-90">Neural network processing</p>
    </div>
  </div>
);

const VishScoreDisplay: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-white mb-2">85</div>
        <div className="text-white text-lg font-semibold">Vish Score</div>
      </div>
    </div>
    <div className="relative z-10 text-white">
      <Award className="h-8 w-8 mb-2" />
      <h3 className="text-lg font-bold">Comprehensive Rating</h3>
    </div>
  </div>
);

const DataVisualization: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg p-6">
    <div className="text-white mb-4">
      <TrendingUp className="h-8 w-8 mb-2" />
      <h3 className="text-xl font-bold">Data Analytics</h3>
    </div>
    <div className="grid grid-cols-3 gap-2 h-20">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="bg-white bg-opacity-30 rounded animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  </div>
);

const FoodScanner: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg p-6 relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-24 h-24 border-2 border-white border-dashed rounded-lg animate-pulse flex items-center justify-center">
        <Camera className="h-8 w-8 text-white" />
      </div>
    </div>
    <div className="relative z-10 text-white">
      <h3 className="text-xl font-bold mb-2">Smart Scanner</h3>
      <p className="text-sm opacity-90">Instant food recognition</p>
    </div>
  </div>
);

const HealthMetrics: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg p-6">
    <div className="text-white mb-4">
      <Heart className="h-8 w-8 mb-2" />
      <h3 className="text-xl font-bold">Health Impact</h3>
    </div>
    <div className="space-y-2">
      {['Cardiovascular', 'Diabetes Risk', 'Nutrition Score'].map((metric, i) => (
        <div key={metric} className="flex justify-between items-center">
          <span className="text-sm text-white opacity-90">{metric}</span>
          <div className="w-16 bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2"
              style={{ width: `${Math.random() * 80 + 20}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FlavorAnalysis: React.FC = () => (
  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg p-6 relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 bg-white bg-opacity-40 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
    <div className="relative z-10 text-white">
      <Beaker className="h-8 w-8 mb-2" />
      <h3 className="text-xl font-bold">Flavor Lab</h3>
      <p className="text-sm opacity-90">Molecular taste analysis</p>
    </div>
  </div>
);

// Original image data using custom components
const images: ImageItem[] = [
  {
    id: 'nutrition-analysis',
    title: 'AI Nutrition Analysis',
    description: 'Advanced AI analyzing nutritional content and health impacts of packaged foods',
    category: 'nutrition',
    component: <NutritionChart />,
    alt: 'AI nutrition analysis visualization with charts and data'
  },
  {
    id: 'health-metrics',
    title: 'Health Impact Assessment',
    description: 'Comprehensive health metrics and risk analysis for food products',
    category: 'nutrition',
    component: <HealthMetrics />,
    alt: 'Health impact metrics dashboard'
  },
  {
    id: 'taste-science',
    title: 'Taste Science Laboratory',
    description: 'Scientific analysis of flavor compounds and taste profiles',
    category: 'taste',
    component: <TasteProfile />,
    alt: 'Taste science analysis with flavor profiling'
  },
  {
    id: 'flavor-analysis',
    title: 'Molecular Flavor Analysis',
    description: 'Advanced molecular gastronomy and flavor compound visualization',
    category: 'taste',
    component: <FlavorAnalysis />,
    alt: 'Molecular flavor analysis laboratory'
  },
  {
    id: 'consumer-feedback',
    title: 'Consumer Satisfaction Data',
    description: 'Real-time consumer feedback and rating visualization',
    category: 'consumer',
    component: <ConsumerRating />,
    alt: 'Consumer rating and feedback system'
  },
  {
    id: 'vish-score-display',
    title: 'Vish Score System',
    description: 'Revolutionary scoring system combining nutrition, taste, and consumer data',
    category: 'consumer',
    component: <VishScoreDisplay />,
    alt: 'Vish Score comprehensive rating display'
  },
  {
    id: 'ai-brain',
    title: 'AI Food Intelligence',
    description: 'Neural network processing for comprehensive food analysis',
    category: 'general',
    component: <AIBrain />,
    alt: 'AI brain processing food intelligence data'
  },
  {
    id: 'food-scanner',
    title: 'Smart Food Scanner',
    description: 'Instant food recognition and analysis technology',
    category: 'general',
    component: <FoodScanner />,
    alt: 'Smart food scanning technology interface'
  },
  {
    id: 'data-visualization',
    title: 'Analytics Dashboard',
    description: 'Comprehensive data visualization and analytics platform',
    category: 'general',
    component: <DataVisualization />,
    alt: 'Food analytics dashboard with data visualization'
  }
];

export const ImageGallery: React.FC<ImageGalleryProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = [
    { id: 'all', name: 'All Visuals', icon: <Camera className="h-4 w-4" /> },
    { id: 'nutrition', name: 'Nutrition Analysis', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'taste', name: 'Taste Science', icon: <Star className="h-4 w-4" /> },
    { id: 'consumer', name: 'Consumer Ratings', icon: <Users className="h-4 w-4" /> },
    { id: 'general', name: 'AI Technology', icon: <Zap className="h-4 w-4" /> }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const openImageModal = (image: ImageItem) => {
    setSelectedImage(image);
    setCurrentImageIndex(filteredImages.findIndex(img => img.id === image.id));
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentImageIndex < filteredImages.length - 1 ? currentImageIndex + 1 : 0;
    }
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  const downloadVisualization = (title: string) => {
    // Create a canvas to capture the visualization
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 300);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#3b82f6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 300);
      
      // Add title text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title, 200, 150);
      
      // Add FoodCheck branding
      ctx.font = '16px Arial';
      ctx.fillText('FoodCheck AI Visualization', 200, 180);
      
      // Download the canvas as image
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Food Analysis Visualizations</h2>
                <p className="text-green-100">Original AI-generated visual concepts</p>
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category.icon}
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Visualization Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => openImageModal(image)}
              >
                <div className="relative overflow-hidden">
                  {image.component}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      image.category === 'nutrition' ? 'bg-green-500 text-white' :
                      image.category === 'taste' ? 'bg-blue-500 text-white' :
                      image.category === 'consumer' ? 'bg-purple-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {image.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {image.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {image.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No visualizations found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try selecting a different category to see more visualizations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Visualization Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60 p-4">
          <div className="relative max-w-4xl w-full">
            {/* Navigation */}
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200 z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="transform scale-150 origin-center mb-6">
                  {selectedImage.component}
                </div>
              </div>
              
              {/* Visualization Info */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedImage.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedImage.description}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadVisualization(selectedImage.title)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    title="Download Visualization"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedImage.category === 'nutrition' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                    selectedImage.category === 'taste' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
                    selectedImage.category === 'consumer' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300' :
                    'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
                  }`}>
                    {selectedImage.category.charAt(0).toUpperCase() + selectedImage.category.slice(1)}
                  </span>
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentImageIndex + 1} of {filteredImages.length}
                  </span>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Original Content:</strong> These visualizations are created specifically for FoodCheck and represent our AI analysis concepts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};