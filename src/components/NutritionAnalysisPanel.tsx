import React from 'react';
import { BarChart3, Heart, AlertTriangle, CheckCircle, Zap, Shield, TrendingUp, Activity } from 'lucide-react';

interface NutritionData {
  calories: number;
  totalFat: string;
  saturatedFat: string;
  transFat: string;
  cholesterol: string;
  sodium: string;
  totalCarbohydrates: string;
  dietaryFiber: string;
  totalSugars: string;
  addedSugars: string;
  protein: string;
  vitamins: string[];
}

interface HealthData {
  score: number;
  warnings: string[];
  recommendations: string[];
  allergens: string[];
}

interface NutritionAnalysisPanelProps {
  nutrition: NutritionData;
  health: HealthData;
  className?: string;
}

export const NutritionAnalysisPanel: React.FC<NutritionAnalysisPanelProps> = ({
  nutrition,
  health,
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

  const getHealthLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Healthy';
    if (score >= 70) return 'Healthy';
    if (score >= 60) return 'Moderately Healthy';
    if (score >= 50) return 'Average';
    if (score >= 40) return 'Below Average';
    return 'Poor';
  };

  const getNutrientStatus = (value: string, type: 'good' | 'moderate' | 'bad') => {
    const colors = {
      good: 'text-green-600 dark:text-green-400',
      moderate: 'text-yellow-600 dark:text-yellow-400',
      bad: 'text-red-600 dark:text-red-400'
    };
    return colors[type];
  };

  const parseNumericValue = (value: string): number => {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getNutrientLevel = (value: string, nutrient: string) => {
    const numValue = parseNumericValue(value);
    
    switch (nutrient) {
      case 'sodium':
        if (numValue < 140) return 'good';
        if (numValue < 400) return 'moderate';
        return 'bad';
      case 'sugar':
        if (numValue < 5) return 'good';
        if (numValue < 15) return 'moderate';
        return 'bad';
      case 'saturatedFat':
        if (numValue < 3) return 'good';
        if (numValue < 7) return 'moderate';
        return 'bad';
      case 'fiber':
        if (numValue >= 5) return 'good';
        if (numValue >= 2) return 'moderate';
        return 'bad';
      case 'protein':
        if (numValue >= 10) return 'good';
        if (numValue >= 5) return 'moderate';
        return 'bad';
      default:
        return 'moderate';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nutrition Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Complete nutritional breakdown and health impact</p>
        </div>
      </div>

      {/* Health Score */}
      <div className={`${getScoreBackground(health.score)} rounded-lg p-4 mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Health Score</span>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(health.score)}`}>
            {health.score}/100
          </span>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getHealthLevel(health.score)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, health.score))}%` }}
          />
        </div>
      </div>

      {/* Key Nutrition Facts */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Key Nutrition Facts</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Calories */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
              <span className="font-bold text-gray-900 dark:text-white">{nutrition.calories}</span>
            </div>
          </div>
          
          {/* Protein */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
              <span className={`font-bold ${getNutrientStatus(nutrition.protein, getNutrientLevel(nutrition.protein, 'protein'))}`}>
                {nutrition.protein}
              </span>
            </div>
          </div>
          
          {/* Total Fat */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Fat</span>
              <span className="font-bold text-gray-900 dark:text-white">{nutrition.totalFat}</span>
            </div>
          </div>
          
          {/* Sodium */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sodium</span>
              <span className={`font-bold ${getNutrientStatus(nutrition.sodium, getNutrientLevel(nutrition.sodium, 'sodium'))}`}>
                {nutrition.sodium}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Nutrition */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Detailed Breakdown</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Saturated Fat</span>
            <span className={`font-medium ${getNutrientStatus(nutrition.saturatedFat, getNutrientLevel(nutrition.saturatedFat, 'saturatedFat'))}`}>
              {nutrition.saturatedFat}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Carbohydrates</span>
            <span className="font-medium text-gray-900 dark:text-white">{nutrition.totalCarbohydrates}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Dietary Fiber</span>
            <span className={`font-medium ${getNutrientStatus(nutrition.dietaryFiber, getNutrientLevel(nutrition.dietaryFiber, 'fiber'))}`}>
              {nutrition.dietaryFiber}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Sugars</span>
            <span className={`font-medium ${getNutrientStatus(nutrition.totalSugars, getNutrientLevel(nutrition.totalSugars, 'sugar'))}`}>
              {nutrition.totalSugars}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Cholesterol</span>
            <span className="font-medium text-gray-900 dark:text-white">{nutrition.cholesterol}</span>
          </div>
        </div>
      </div>

      {/* Health Warnings */}
      {health.warnings.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Health Warnings</h4>
          </div>
          <div className="space-y-2">
            {health.warnings.map((warning, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-300">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Recommendations */}
      {health.recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Recommendations</h4>
          </div>
          <div className="space-y-2">
            {health.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-700 dark:text-green-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vitamins & Minerals */}
      {nutrition.vitamins.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Vitamins & Minerals</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {nutrition.vitamins.map((vitamin, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium border border-yellow-200 dark:border-yellow-800"
              >
                {vitamin}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Science Info */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>FDA Guidelines</span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Health Analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3" />
            <span>Wellness Focus</span>
          </div>
        </div>
      </div>
    </div>
  );
};