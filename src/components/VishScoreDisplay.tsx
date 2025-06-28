import React from 'react';
import { Star, BarChart3, Users, Award, TrendingUp, Heart, Zap } from 'lucide-react';

interface VishScoreDisplayProps {
  nutritionScore: number;
  tasteScore: number;
  consumerScore: number;
  vishScore: number;
  grade: string;
  className?: string;
}

export const VishScoreDisplay: React.FC<VishScoreDisplayProps> = ({
  nutritionScore,
  tasteScore,
  consumerScore,
  vishScore,
  grade,
  className = ''
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-yellow-500 text-white';
      case 'D': return 'bg-orange-500 text-white';
      case 'F': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getProgressWidth = (score: number) => `${Math.min(100, Math.max(0, score))}%`;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full">
            <Award className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Vish Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive Food Rating</p>
          </div>
        </div>
        
        {/* Main Score Display */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(vishScore)} mb-2`}>
              {vishScore}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-400">out of 100</div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold px-4 py-2 rounded-full ${getGradeColor(grade)} mb-2`}>
              {grade}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Grade</div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
          Score Breakdown
        </h4>
        
        {/* Nutrition Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-900 dark:text-white">Nutrition</span>
            </div>
            <span className={`font-bold ${getScoreColor(nutritionScore)}`}>
              {nutritionScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: getProgressWidth(nutritionScore) }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Health impact, vitamins, minerals, and nutritional value
          </p>
        </div>

        {/* Taste Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">Taste Quality</span>
            </div>
            <span className={`font-bold ${getScoreColor(tasteScore)}`}>
              {tasteScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: getProgressWidth(tasteScore) }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Flavor profile, texture, and sensory satisfaction
          </p>
        </div>

        {/* Consumer Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-gray-900 dark:text-white">Consumer Rating</span>
            </div>
            <span className={`font-bold ${getScoreColor(consumerScore)}`}>
              {consumerScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: getProgressWidth(consumerScore) }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Real user feedback, satisfaction, and purchase intent
          </p>
        </div>
      </div>

      {/* Formula Display */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Vish Score Formula
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            ({nutritionScore} + {tasteScore} + {consumerScore}) ÷ 3 = <span className="font-bold text-yellow-600 dark:text-yellow-400">{vishScore}</span>
          </p>
        </div>
      </div>

      {/* Score Interpretation */}
      <div className="mt-4 text-center">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">80-100: Excellent</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">70-79: Good</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">60-69: Fair</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Below 60: Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
};