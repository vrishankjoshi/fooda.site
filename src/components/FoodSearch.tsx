import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Star, BarChart3, Users, Package, Filter, X, Plus, Camera } from 'lucide-react';
import { foodDatabaseService, FoodItem, FoodSearchResult } from '../services/foodDatabaseService';

interface FoodSearchProps {
  onFoodSelect: (food: FoodItem) => void;
  placeholder?: string;
  showFilters?: boolean;
  maxResults?: number;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({
  onFoodSelect,
  placeholder = "Search for food items...",
  showFilters = true,
  maxResults = 20
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showFilters, setShowFiltersPanel] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    minHealthScore: 0,
    maxCalories: 1000,
    source: 'all'
  });
  const [page, setPage] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query, 1);
      }, 300);
    } else {
      setResults(null);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, filters]);

  const performSearch = async (searchQuery: string, searchPage: number) => {
    setIsLoading(true);
    try {
      const searchResults = await foodDatabaseService.searchFoods(searchQuery, searchPage, maxResults);
      
      // Apply local filters
      const filteredResults = {
        ...searchResults,
        items: searchResults.items.filter(food => {
          if (filters.category !== 'all' && !food.category.toLowerCase().includes(filters.category)) {
            return false;
          }
          if (food.healthScore < filters.minHealthScore) {
            return false;
          }
          if (food.nutrition.calories > filters.maxCalories) {
            return false;
          }
          if (filters.source !== 'all' && food.source !== filters.source) {
            return false;
          }
          return true;
        })
      };

      if (searchPage === 1) {
        setResults(filteredResults);
      } else {
        setResults(prev => prev ? {
          ...filteredResults,
          items: [...prev.items, ...filteredResults.items]
        } : filteredResults);
      }
      setPage(searchPage);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (results && results.hasMore && !isLoading) {
      performSearch(query, page + 1);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    onFoodSelect(food);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'api': return '🌐';
      case 'user': return '👤';
      case 'database': return '📚';
      default: return '📦';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300 text-lg"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
        
        {/* Filter toggle */}
        {showFilters && (
          <button
            onClick={() => setShowFiltersPanel(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
              showFilters ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && showFilters && (
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="snack">Snacks</option>
                <option value="dairy">Dairy</option>
                <option value="beverage">Beverages</option>
                <option value="cereal">Cereals</option>
                <option value="packaged">Packaged Foods</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Health Score
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minHealthScore}
                onChange={(e) => setFilters(prev => ({ ...prev, minHealthScore: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{filters.minHealthScore}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Calories
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={filters.maxCalories}
                onChange={(e) => setFilters(prev => ({ ...prev, maxCalories: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{filters.maxCalories}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
              >
                <option value="all">All Sources</option>
                <option value="api">API Data</option>
                <option value="database">Database</option>
                <option value="user">User Added</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          {/* Results Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Results ({results.total} found)
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {results.page}
              </span>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto">
            {results.items.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No foods found
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {results.items.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleFoodSelect(food)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {food.name}
                          </h4>
                          <span className="text-sm">{getSourceIcon(food.source)}</span>
                          {food.brand && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              by {food.brand}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>{food.category}</span>
                          <span>•</span>
                          <span>{food.nutrition.calories} cal</span>
                          <span>•</span>
                          <span>{food.servingSize}</span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className={`text-sm font-medium ${getScoreColor(food.healthScore)}`}>
                              {food.healthScore}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className={`text-sm font-medium ${getScoreColor(food.tasteScore)}`}>
                              {food.tasteScore}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className={`text-sm font-medium ${getScoreColor(food.consumerScore)}`}>
                              {food.consumerScore}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(food.vishScore)}`}>
                          {food.vishScore}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Vish Score</div>
                      </div>
                    </div>

                    {/* Nutrition Preview */}
                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {food.nutrition.protein}g
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {food.nutrition.carbohydrates}g
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {food.nutrition.fat}g
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Fat</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {food.nutrition.sodium}mg
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">Sodium</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {results.hasMore && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Load More</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {query.length === 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setQuery('healthy snacks')}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Healthy Snacks</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">High nutrition score</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setQuery('popular brands')}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Popular Brands</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">High consumer rating</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setQuery('low calorie')}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Low Calorie</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Diet-friendly options</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};