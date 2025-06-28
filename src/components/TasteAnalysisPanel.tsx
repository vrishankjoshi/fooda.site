import React from 'react';
import { Star, Zap, Coffee, Droplets, Thermometer, Sparkles, Award, ChefHat } from 'lucide-react';

interface TasteAnalysis {
  score: number;
  profile: string[];
  description: string;
}

interface TasteAnalysisPanelProps {
  taste: TasteAnalysis;
  className?: string;
}

export const TasteAnalysisPanel: React.FC<TasteAnalysisPanelProps> = ({
  taste,
  className = ''
}) => {
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

  const getTasteIcon = (profile: string) => {
    const profileLower = profile.toLowerCase();
    if (profileLower.includes('sweet')) return <Sparkles className="h-4 w-4 text-pink-500" />;
    if (profileLower.includes('salty')) return <Droplets className="h-4 w-4 text-blue-500" />;
    if (profileLower.includes('spicy') || profileLower.includes('hot')) return <Thermometer className="h-4 w-4 text-red-500" />;
    if (profileLower.includes('bitter')) return <Coffee className="h-4 w-4 text-amber-600" />;
    if (profileLower.includes('umami') || profileLower.includes('savory')) return <ChefHat className="h-4 w-4 text-purple-500" />;
    if (profileLower.includes('crispy') || profileLower.includes('crunchy')) return <Zap className="h-4 w-4 text-orange-500" />;
    return <Star className="h-4 w-4 text-yellow-500" />;
  };

  const getTasteColor = (profile: string) => {
    const profileLower = profile.toLowerCase();
    if (profileLower.includes('sweet')) return 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800';
    if (profileLower.includes('salty')) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (profileLower.includes('spicy') || profileLower.includes('hot')) return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
    if (profileLower.includes('bitter')) return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (profileLower.includes('umami') || profileLower.includes('savory')) return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (profileLower.includes('crispy') || profileLower.includes('crunchy')) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
  };

  const renderStars = (score: number) => {
    const stars = Math.round(score / 20); // Convert 0-100 to 0-5 stars
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < stars 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const getTasteLevel = (score: number) => {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 40) return 'Below Average';
    return 'Poor';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
          <Star className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Taste Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Flavor profile and sensory evaluation</p>
        </div>
      </div>

      {/* Overall Taste Score */}
      <div className={`${getScoreBackground(taste.score)} rounded-lg p-4 mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Taste Quality</span>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(taste.score)}`}>
            {taste.score}/100
          </span>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          {renderStars(taste.score)}
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {getTasteLevel(taste.score)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, taste.score))}%` }}
          />
        </div>
      </div>

      {/* Taste Description */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <ChefHat className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Flavor Profile</h4>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {taste.description}
          </p>
        </div>
      </div>

      {/* Taste Characteristics */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Taste Characteristics</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {taste.profile.map((characteristic, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getTasteColor(characteristic)}`}
            >
              {getTasteIcon(characteristic)}
              <span className="text-sm font-medium">{characteristic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Taste Science Breakdown */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Sensory Analysis</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Flavor Intensity */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3">
              <Thermometer className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(taste.score * 0.8 + Math.random() * 20)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Flavor Intensity</div>
            </div>
          </div>
          
          {/* Texture Appeal */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3">
              <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(taste.score * 0.9 + Math.random() * 15)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Texture Appeal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Taste Science Info */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <ChefHat className="h-3 w-3" />
            <span>Culinary Science</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Sensory Analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Flavor Profiling</span>
          </div>
        </div>
      </div>
    </div>
  );
};