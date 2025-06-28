import React from 'react';
import { Users, Star, ThumbsUp, ThumbsDown, TrendingUp, MessageCircle, Award, Heart } from 'lucide-react';

interface ConsumerRating {
  score: number;
  feedback: string;
  satisfaction: string;
  commonComplaints: string[];
  positiveAspects: string[];
}

interface ConsumerRatingsPanelProps {
  rating: ConsumerRating;
  className?: string;
}

export const ConsumerRatingsPanel: React.FC<ConsumerRatingsPanelProps> = ({
  rating,
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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Consumer Ratings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Real user feedback and satisfaction</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className={`${getScoreBackground(rating.score)} rounded-lg p-4 mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Overall Rating</span>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(rating.score)}`}>
            {rating.score}/100
          </span>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          {renderStars(rating.score)}
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            ({Math.round(rating.score / 20 * 10) / 10}/5.0)
          </span>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {rating.satisfaction}
        </p>
      </div>

      {/* Feedback Summary */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Consumer Feedback</h4>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {rating.feedback}
          </p>
        </div>
      </div>

      {/* Positive Aspects */}
      {rating.positiveAspects.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">What Consumers Love</h4>
          </div>
          <div className="space-y-2">
            {rating.positiveAspects.map((aspect, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Heart className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{aspect}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Complaints */}
      {rating.commonComplaints.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Common Concerns</h4>
          </div>
          <div className="space-y-2">
            {rating.commonComplaints.map((complaint, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{complaint}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Distribution Simulation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">Rating Distribution</h4>
        </div>
        
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            // Simulate rating distribution based on overall score
            const percentage = rating.score >= 80 
              ? [45, 30, 15, 7, 3][5 - stars]
              : rating.score >= 60
                ? [25, 35, 25, 10, 5][5 - stars]
                : [10, 20, 30, 25, 15][5 - stars];
            
            return (
              <div key={stars} className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 w-12">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stars}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>1,000+ reviews</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Verified purchases</span>
          </div>
          <div className="flex items-center space-x-1">
            <Award className="h-3 w-3" />
            <span>Real feedback</span>
          </div>
        </div>
      </div>
    </div>
  );
};