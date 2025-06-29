import React, { useState } from 'react';
import { X, Plus, Minus, BarChart3, Star, Users, Award, TrendingUp, Zap } from 'lucide-react';
import { foodDatabaseService, FoodItem } from '../services/foodDatabaseService';

interface FoodComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  initialFoods?: FoodItem[];
}

export const FoodComparison: React.FC<FoodComparisonProps> = ({ isOpen, onClose, initialFoods = [] }) => {
  const [comparedFoods, setComparedFoods] = useState<FoodItem[]>(initialFoods);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await foodDatabaseService.searchFoods(searchQuery, 1, 10);
      setSearchResults(results.items);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addFood = (food: FoodItem) => {
    if (comparedFoods.length < 4 && !comparedFoods.find(f => f.id === food.id)) {
      setComparedFoods([...comparedFoods, food]);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const removeFood = (foodId: string) => {
    setComparedFoods(comparedFoods.filter(f => f.id !== foodId));
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

  const getBestScore = (scores: number[]) => Math.max(...scores);
  const getWorstScore = (scores: number[]) => Math.min(...scores);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Food Comparison</h2>
                <p className="text-purple-100">Compare up to 4 foods side by side</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Add Food Search */}
          {comparedFoods.length < 4 && (
            <div className="mt-4 flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for foods to compare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
              {searchResults.map((food) => (
                <button
                  key={food.id}
                  onClick={() => addFood(food)}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-gray-900">{food.name}</div>
                    <div className="text-sm text-gray-600">{food.brand} • Vish Score: {food.vishScore}</div>
                  </div>
                  <Plus className="h-4 w-4 text-purple-600" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {comparedFoods.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start Comparing Foods
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Search and add foods to compare their Vish Scores, nutrition, and more
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Compare similar foods to find the healthiest option, or compare different categories to understand trade-offs.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vish Score Comparison */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-yellow-600" />
                  Vish Score Comparison
                </h3>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparedFoods.length}, 1fr)` }}>
                  {comparedFoods.map((food) => {
                    const vishScores = comparedFoods.map(f => f.vishScore);
                    const isBest = food.vishScore === getBestScore(vishScores);
                    const isWorst = food.vishScore === getWorstScore(vishScores) && vishScores.length > 1;
                    
                    return (
                      <div key={food.id} className="text-center">
                        <div className="relative">
                          <button
                            onClick={() => removeFood(food.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className={`${getScoreBackground(food.vishScore)} rounded-lg p-4 border-2 ${
                            isBest ? 'border-green-500' : isWorst ? 'border-red-500' : 'border-transparent'
                          }`}>
                            <div className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                              {food.name}
                            </div>
                            <div className={`text-3xl font-bold ${getScoreColor(food.vishScore)} mb-2`}>
                              {food.vishScore}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {isBest && '🏆 Best Score'}
                              {isWorst && '⚠️ Lowest Score'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Nutrition Scores */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Nutrition Scores
                  </h4>
                  <div className="space-y-3">
                    {comparedFoods.map((food) => {
                      const nutritionScores = comparedFoods.map(f => f.healthScore);
                      const isBest = food.healthScore === getBestScore(nutritionScores);
                      
                      return (
                        <div key={food.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate mr-2">
                            {food.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getScoreColor(food.healthScore)}`}>
                              {food.healthScore}
                            </span>
                            {isBest && <span className="text-green-500">🏆</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Taste Scores */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-blue-600" />
                    Taste Scores
                  </h4>
                  <div className="space-y-3">
                    {comparedFoods.map((food) => {
                      const tasteScores = comparedFoods.map(f => f.tasteScore);
                      const isBest = food.tasteScore === getBestScore(tasteScores);
                      
                      return (
                        <div key={food.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate mr-2">
                            {food.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getScoreColor(food.tasteScore)}`}>
                              {food.tasteScore}
                            </span>
                            {isBest && <span className="text-blue-500">🏆</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Consumer Scores */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Consumer Scores
                  </h4>
                  <div className="space-y-3">
                    {comparedFoods.map((food) => {
                      const consumerScores = comparedFoods.map(f => f.consumerScore);
                      const isBest = food.consumerScore === getBestScore(consumerScores);
                      
                      return (
                        <div key={food.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate mr-2">
                            {food.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getScoreColor(food.consumerScore)}`}>
                              {food.consumerScore}
                            </span>
                            {isBest && <span className="text-purple-500">🏆</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detailed Nutrition Comparison */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-orange-600" />
                  Nutrition Facts Comparison
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Nutrient</th>
                        {comparedFoods.map((food) => (
                          <th key={food.id} className="text-center py-2 text-gray-900 dark:text-white">
                            {food.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {[
                        { key: 'calories', label: 'Calories', unit: '' },
                        { key: 'protein', label: 'Protein', unit: 'g' },
                        { key: 'fat', label: 'Total Fat', unit: 'g' },
                        { key: 'carbohydrates', label: 'Carbs', unit: 'g' },
                        { key: 'fiber', label: 'Fiber', unit: 'g' },
                        { key: 'sugar', label: 'Sugar', unit: 'g' },
                        { key: 'sodium', label: 'Sodium', unit: 'mg' }
                      ].map((nutrient) => {
                        const values = comparedFoods.map(food => food.nutrition[nutrient.key as keyof typeof food.nutrition] as number);
                        const bestValue = nutrient.key === 'calories' || nutrient.key === 'fat' || nutrient.key === 'sugar' || nutrient.key === 'sodium' 
                          ? Math.min(...values) 
                          : Math.max(...values);
                        
                        return (
                          <tr key={nutrient.key} className="border-b border-gray-100 dark:border-gray-600">
                            <td className="py-2 text-gray-600 dark:text-gray-400">{nutrient.label}</td>
                            {comparedFoods.map((food) => {
                              const value = food.nutrition[nutrient.key as keyof typeof food.nutrition] as number;
                              const isBest = value === bestValue;
                              
                              return (
                                <td key={food.id} className="text-center py-2">
                                  <span className={`font-medium ${isBest ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                    {value}{nutrient.unit}
                                    {isBest && ' 🏆'}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  🎯 Recommendation
                </h4>
                {(() => {
                  const bestFood = comparedFoods.reduce((best, current) => 
                    current.vishScore > best.vishScore ? current : best
                  );
                  
                  return (
                    <p className="text-gray-700 dark:text-gray-300">
                      Based on the comprehensive Vish Score analysis, <strong>{bestFood.name}</strong> is the best choice 
                      with a score of {bestFood.vishScore}/100. It offers the best balance of nutrition, taste, and consumer satisfaction.
                    </p>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};