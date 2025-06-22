import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Heart, Star, BarChart3, Users, Camera, Zap } from 'lucide-react';

interface ImageItem {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'taste' | 'consumer' | 'general';
  url: string;
  alt: string;
}

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

// AI-generated images related to food analysis and Vish Score
const images: ImageItem[] = [
  {
    id: 'nutrition-analysis',
    title: 'AI Nutrition Analysis',
    description: 'Advanced AI analyzing nutritional content and health impacts of packaged foods',
    category: 'nutrition',
    url: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'AI analyzing nutrition data with colorful charts and graphs'
  },
  {
    id: 'healthy-food-scanner',
    title: 'Smart Food Scanner',
    description: 'Futuristic food scanning technology identifying healthy ingredients',
    category: 'nutrition',
    url: 'https://images.pexels.com/photos/7195706/pexels-photo-7195706.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'High-tech food scanner analyzing fresh produce'
  },
  {
    id: 'taste-science',
    title: 'Taste Science Laboratory',
    description: 'Scientific analysis of flavor compounds and taste profiles',
    category: 'taste',
    url: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Laboratory setting with colorful chemical analysis of food flavors'
  },
  {
    id: 'flavor-molecules',
    title: 'Flavor Molecular Structure',
    description: 'Molecular gastronomy and flavor compound visualization',
    category: 'taste',
    url: 'https://images.pexels.com/photos/8844895/pexels-photo-8844895.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Artistic representation of flavor molecules and taste compounds'
  },
  {
    id: 'consumer-feedback',
    title: 'Consumer Satisfaction Data',
    description: 'Real-time consumer feedback and rating visualization',
    category: 'consumer',
    url: 'https://images.pexels.com/photos/7947664/pexels-photo-7947664.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'People rating food products with digital feedback systems'
  },
  {
    id: 'food-rating-system',
    title: 'Digital Food Rating',
    description: 'Modern rating system showing consumer preferences and satisfaction',
    category: 'consumer',
    url: 'https://images.pexels.com/photos/7947665/pexels-photo-7947665.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Digital interface showing food ratings and consumer reviews'
  },
  {
    id: 'ai-food-analysis',
    title: 'AI Food Intelligence',
    description: 'Comprehensive AI system analyzing all aspects of food quality',
    category: 'general',
    url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Futuristic AI interface analyzing food with holographic displays'
  },
  {
    id: 'nutrition-dashboard',
    title: 'Nutrition Dashboard',
    description: 'Interactive dashboard showing comprehensive food analysis results',
    category: 'general',
    url: 'https://images.pexels.com/photos/7947666/pexels-photo-7947666.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Modern dashboard interface with nutrition data and analytics'
  },
  {
    id: 'healthy-lifestyle',
    title: 'Healthy Food Choices',
    description: 'People making informed food decisions with AI assistance',
    category: 'general',
    url: 'https://images.pexels.com/photos/4099235/pexels-photo-4099235.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'People choosing healthy foods with digital guidance'
  },
  {
    id: 'food-tech-innovation',
    title: 'Food Tech Innovation',
    description: 'Cutting-edge technology revolutionizing food analysis',
    category: 'general',
    url: 'https://images.pexels.com/photos/8386441/pexels-photo-8386441.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Innovative food technology with AI and digital interfaces'
  }
];

export const ImageGallery: React.FC<ImageGalleryProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = [
    { id: 'all', name: 'All Images', icon: <Camera className="h-4 w-4" /> },
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

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                <h2 className="text-2xl font-bold text-white">AI-Generated Food Analysis Gallery</h2>
                <p className="text-green-100">Visualizing the future of food intelligence</p>
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

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => openImageModal(image)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
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
                No images found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try selecting a different category to see more images.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
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

            {/* Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="w-full max-h-[60vh] object-contain"
              />
              
              {/* Image Info */}
              <div className="p-6">
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
                    onClick={() => downloadImage(selectedImage.url, selectedImage.title)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    title="Download Image"
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};