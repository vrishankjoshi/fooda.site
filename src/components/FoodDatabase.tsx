import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Star, BarChart3, Users, Award, TrendingUp, Heart, Eye, ShoppingCart, Bookmark, Share2, Camera, Zap, Globe } from 'lucide-react';
import { foodDatabaseService, FoodItem, FoodSearchResult } from '../services/foodDatabaseService';

interface FoodDatabaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoodDatabase: React.FC<FoodDatabaseProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'popular' | 'healthy' | 'american' | 'categories'>('search');
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [healthyFoods, setHealthyFoods] = useState<FoodItem[]>([]);
  const [americanFoods, setAmericanFoods] = useState<FoodItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      loadUserData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    const popular = foodDatabaseService.getPopularFoods(20);
    const healthy = foodDatabaseService.getHealthyFoods(20);
    const american = foodDatabaseService.getAmericanFoods(20);
    
    setPopularFoods(popular);
    setHealthyFoods(healthy);
    setAmericanFoods(american);
  };

  const loadUserData = () => {
    const savedFavorites = localStorage.getItem('foodcheck_favorites');
    const savedShoppingList = localStorage.getItem('foodcheck_shopping_list');
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedShoppingList) setShoppingList(JSON.parse(savedShoppingList));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await foodDatabaseService.searchFoods(searchQuery, 1, 20);
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (foodId: string) => {
    const newFavorites = favorites.includes(foodId)
      ? favorites.filter(id => id !== foodId)
      : [...favorites, foodId];
    
    setFavorites(newFavorites);
    localStorage.setItem('foodcheck_favorites', JSON.stringify(newFavorites));
  };

  const toggleShoppingList = (foodId: string) => {
    const newShoppingList = shoppingList.includes(foodId)
      ? shoppingList.filter(id => id !== foodId)
      : [...shoppingList, foodId];
    
    setShoppingList(newShoppingList);
    localStorage.setItem('foodcheck_shopping_list', JSON.stringify(newShoppingList));
  };

  const shareFood = (food: FoodItem) => {
    if (navigator.share) {
      navigator.share({
        title: `${food.name} - Vish Score: ${food.vishScore}`,
        text: `Check out this food analysis on FoodCheck! ${food.name} has a Vish Score of ${food.vishScore}/100`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers without Web Share API
      const text = `Check out ${food.name} on FoodCheck! Vish Score: ${food.vishScore}/100`;
      navigator.clipboard.writeText(text);
      alert('Food info copied to clipboard!');
    }
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

  const FoodCard: React.FC<{ food: FoodItem; onClick: () => void }> = ({ food, onClick }) => (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-600">
      <div onClick={onClick}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              {food.name}
            </h4>
            {food.brand && (
              <p className="text-xs text-gray-600 dark:text-gray-400">{food.brand}</p>
            )}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(food.vishScore)} ${getScoreBackground(food.vishScore)}`}>
            {food.vishScore}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="text-center">
            <div className={`font-bold ${getScoreColor(food.healthScore)}`}>{food.healthScore}</div>
            <div className="text-gray-500 dark:text-gray-400">Nutrition</div>
          </div>
          <div className="text-center">
            <div className={`font-bold ${getScoreColor(food.tasteScore)}`}>{food.tasteScore}</div>
            <div className="text-gray-500 dark:text-gray-400">Taste</div>
          </div>
          <div className="text-center">
            <div className={`font-bold ${getScoreColor(food.consumerScore)}`}>{food.consumerScore}</div>
            <div className="text-gray-500 dark:text-gray-400">Consumer</div>
          </div>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {food.nutrition.calories} cal • {food.nutrition.protein}g protein • {food.category}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(food.id);
            }}
            className={`p-1 rounded ${favorites.includes(food.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`h-4 w-4 ${favorites.includes(food.id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleShoppingList(food.id);
            }}
            className={`p-1 rounded ${shoppingList.includes(food.id) ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              shareFood(food);
            }}
            className="p-1 rounded text-gray-400 hover:text-green-500"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={onClick}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center space-x-1"
        >
          <Eye className="h-3 w-3" />
          <span>View</span>
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Food Database</h2>
                <p className="text-green-100">Search and discover foods with Vish Scores</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for foods, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-200px)]">
          {/* Sidebar - Categories */}
          <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'search' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Search Results</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('popular')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'popular' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Popular Foods</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('healthy')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'healthy' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Healthy Choices</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('american')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'american' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>American Foods</span>
                </div>
              </button>
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Lists</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Favorites:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{favorites.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shopping List:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{shoppingList.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Food List */}
            <div className="w-1/2 p-4 overflow-y-auto">
              {activeTab === 'search' && searchResults && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Search Results ({searchResults.total} found)
                  </h3>
                  <div className="grid gap-4">
                    {searchResults.items.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onClick={() => setSelectedFood(food)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'popular' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Popular Foods
                  </h3>
                  <div className="grid gap-4">
                    {popularFoods.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onClick={() => setSelectedFood(food)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'healthy' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Healthy Choices (70+ Vish Score)
                  </h3>
                  <div className="grid gap-4">
                    {healthyFoods.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onClick={() => setSelectedFood(food)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'american' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    American Foods
                  </h3>
                  <div className="grid gap-4">
                    {americanFoods.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onClick={() => setSelectedFood(food)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'search' && !searchResults && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Search for Foods
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter a food name, brand, or category to get started
                  </p>
                </div>
              )}
            </div>

            {/* Food Details */}
            <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
              {selectedFood ? (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedFood.name}
                      </h3>
                      {selectedFood.brand && (
                        <p className="text-gray-600 dark:text-gray-400">{selectedFood.brand}</p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedFood.category}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleFavorite(selectedFood.id)}
                        className={`p-2 rounded-lg ${favorites.includes(selectedFood.id) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                      >
                        <Heart className={`h-5 w-5 ${favorites.includes(selectedFood.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => toggleShoppingList(selectedFood.id)}
                        className={`p-2 rounded-lg ${shoppingList.includes(selectedFood.id) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => shareFood(selectedFood)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Vish Score Display */}
                  <div className={`${getScoreBackground(selectedFood.vishScore)} rounded-lg p-4 mb-6`}>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(selectedFood.vishScore)} mb-2`}>
                        {selectedFood.vishScore}/100
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Vish Score
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(selectedFood.healthScore)}`}>
                            {selectedFood.healthScore}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Nutrition</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(selectedFood.tasteScore)}`}>
                            {selectedFood.tasteScore}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Taste</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(selectedFood.consumerScore)}`}>
                            {selectedFood.consumerScore}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Consumer</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Facts */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                      Nutrition Facts
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedFood.nutrition.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedFood.nutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Fat:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedFood.nutrition.fat}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedFood.nutrition.carbohydrates}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fiber:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedFood.nutrition.fiber}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Sugar:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedFood.nutrition.sugar}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Sodium:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedFood.nutrition.sodium}mg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Serving:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedFood.servingSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  {selectedFood.ingredients.length > 0 && (
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedFood.ingredients.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Allergens */}
                  {selectedFood.allergens.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Allergen Information</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFood.allergens.map((allergen, index) => (
                          <span key={index} className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Select a Food
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a food from the list to view detailed information
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};