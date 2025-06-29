import React, { useState } from 'react';
import { X, Plus, Minus, ChefHat, Calculator, BarChart3, Star, Users, Award, Trash2 } from 'lucide-react';
import { foodDatabaseService, FoodItem } from '../services/foodDatabaseService';

interface Ingredient {
  id: string;
  food: FoodItem | null;
  amount: number;
  unit: string;
  name: string;
}

interface RecipeAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeAnalyzer: React.FC<RecipeAnalyzerProps> = ({ isOpen, onClose }) => {
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIngredientId, setActiveIngredientId] = useState<string | null>(null);
  const [recipeAnalysis, setRecipeAnalysis] = useState<any>(null);

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      food: null,
      amount: 1,
      unit: 'cup',
      name: ''
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, ...updates } : ing
    ));
  };

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

  const selectFood = (food: FoodItem) => {
    if (activeIngredientId) {
      updateIngredient(activeIngredientId, { food, name: food.name });
      setActiveIngredientId(null);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const analyzeRecipe = () => {
    const validIngredients = ingredients.filter(ing => ing.food && ing.amount > 0);
    
    if (validIngredients.length === 0) {
      alert('Please add at least one ingredient with a valid food item.');
      return;
    }

    // Calculate total nutrition
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    validIngredients.forEach(ingredient => {
      if (ingredient.food) {
        // Simple conversion factor (this would be more sophisticated in a real app)
        const conversionFactor = ingredient.unit === 'cup' ? 0.25 : 
                               ingredient.unit === 'tbsp' ? 0.0625 :
                               ingredient.unit === 'tsp' ? 0.02 : 1;
        
        const factor = ingredient.amount * conversionFactor;
        
        totalCalories += ingredient.food.nutrition.calories * factor;
        totalProtein += ingredient.food.nutrition.protein * factor;
        totalFat += ingredient.food.nutrition.fat * factor;
        totalCarbs += ingredient.food.nutrition.carbohydrates * factor;
        totalFiber += ingredient.food.nutrition.fiber * factor;
        totalSugar += ingredient.food.nutrition.sugar * factor;
        totalSodium += ingredient.food.nutrition.sodium * factor;
      }
    });

    // Calculate per serving
    const perServing = {
      calories: Math.round(totalCalories / servings),
      protein: Math.round(totalProtein / servings * 10) / 10,
      fat: Math.round(totalFat / servings * 10) / 10,
      carbohydrates: Math.round(totalCarbs / servings * 10) / 10,
      fiber: Math.round(totalFiber / servings * 10) / 10,
      sugar: Math.round(totalSugar / servings * 10) / 10,
      sodium: Math.round(totalSodium / servings)
    };

    // Calculate scores using the same logic as food database
    const nutritionScore = calculateNutritionScore(perServing);
    const tasteScore = calculateTasteScore(perServing);
    const consumerScore = 75; // Default for homemade recipes
    const vishScore = Math.round((nutritionScore + tasteScore + consumerScore) / 3);

    setRecipeAnalysis({
      name: recipeName || 'My Recipe',
      servings,
      nutrition: perServing,
      scores: {
        nutrition: nutritionScore,
        taste: tasteScore,
        consumer: consumerScore,
        vish: vishScore
      },
      ingredients: validIngredients
    });
  };

  const calculateNutritionScore = (nutrition: any): number => {
    let score = 50;
    
    // Positive factors
    if (nutrition.protein >= 20) score += 20;
    else if (nutrition.protein >= 15) score += 15;
    else if (nutrition.protein >= 10) score += 10;
    
    if (nutrition.fiber >= 10) score += 20;
    else if (nutrition.fiber >= 5) score += 15;
    else if (nutrition.fiber >= 3) score += 10;
    
    // Negative factors
    if (nutrition.sugar >= 30) score -= 25;
    else if (nutrition.sugar >= 20) score -= 20;
    else if (nutrition.sugar >= 15) score -= 15;
    
    if (nutrition.sodium >= 1000) score -= 25;
    else if (nutrition.sodium >= 800) score -= 20;
    else if (nutrition.sodium >= 600) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  };

  const calculateTasteScore = (nutrition: any): number => {
    let score = 60; // Base score higher for homemade recipes
    
    // Moderate amounts enhance taste
    if (nutrition.sugar >= 5 && nutrition.sugar <= 15) score += 15;
    if (nutrition.fat >= 8 && nutrition.fat <= 20) score += 15;
    if (nutrition.sodium >= 200 && nutrition.sodium <= 600) score += 10;
    
    return Math.max(0, Math.min(100, score));
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <ChefHat className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Recipe Analyzer</h2>
                <p className="text-orange-100">Analyze homemade recipes with Vish Score</p>
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

        <div className="flex h-[calc(95vh-120px)]">
          {/* Recipe Builder */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              {/* Recipe Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recipe Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Recipe Name
                    </label>
                    <input
                      type="text"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      placeholder="Enter recipe name..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number of Servings
                    </label>
                    <input
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ingredients</h3>
                  <button
                    onClick={addIngredient}
                    className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="number"
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(ingredient.id, { amount: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                          min="0"
                          step="0.1"
                        />
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(ingredient.id, { unit: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                        >
                          <option value="cup">cup</option>
                          <option value="tbsp">tbsp</option>
                          <option value="tsp">tsp</option>
                          <option value="oz">oz</option>
                          <option value="lb">lb</option>
                          <option value="g">g</option>
                          <option value="piece">piece</option>
                        </select>
                        <button
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(ingredient.id, { name: e.target.value })}
                          placeholder="Ingredient name or search..."
                          className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                        />
                        <button
                          onClick={() => {
                            setActiveIngredientId(ingredient.id);
                            setSearchQuery(ingredient.name);
                            if (ingredient.name) handleSearch();
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Search
                        </button>
                      </div>
                      
                      {ingredient.food && (
                        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                          ✓ {ingredient.food.name} ({ingredient.food.brand}) - Vish Score: {ingredient.food.vishScore}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {ingredients.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No ingredients added yet</p>
                    <p className="text-sm">Click "Add" to start building your recipe</p>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Search Results</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => selectFood(food)}
                        className="w-full text-left p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{food.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{food.brand} • Vish: {food.vishScore}</div>
                        </div>
                        <Plus className="h-4 w-4 text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={analyzeRecipe}
                disabled={ingredients.filter(ing => ing.food).length === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Calculator className="h-5 w-5" />
                <span>Analyze Recipe</span>
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {recipeAnalysis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {recipeAnalysis.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Makes {recipeAnalysis.servings} servings
                  </p>
                </div>

                {/* Vish Score */}
                <div className={`${getScoreBackground(recipeAnalysis.scores.vish)} rounded-lg p-6`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(recipeAnalysis.scores.vish)} mb-2`}>
                      {recipeAnalysis.scores.vish}/100
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recipe Vish Score
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(recipeAnalysis.scores.nutrition)}`}>
                          {recipeAnalysis.scores.nutrition}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Nutrition</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(recipeAnalysis.scores.taste)}`}>
                          {recipeAnalysis.scores.taste}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Taste</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(recipeAnalysis.scores.consumer)}`}>
                          {recipeAnalysis.scores.consumer}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Appeal</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nutrition Per Serving */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Nutrition Per Serving
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{recipeAnalysis.nutrition.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{recipeAnalysis.nutrition.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Fat:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{recipeAnalysis.nutrition.fat}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{recipeAnalysis.nutrition.carbohydrates}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fiber:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{recipeAnalysis.nutrition.fiber}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sugar:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{recipeAnalysis.nutrition.sugar}g</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">Sodium:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{recipeAnalysis.nutrition.sodium}mg</span>
                    </div>
                  </div>
                </div>

                {/* Recipe Ingredients */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recipe Ingredients</h4>
                  <div className="space-y-2">
                    {recipeAnalysis.ingredients.map((ingredient: any) => (
                      <div key={ingredient.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {ingredient.amount} {ingredient.unit} {ingredient.name}
                        </span>
                        <span className={`text-xs font-medium ${getScoreColor(ingredient.food.vishScore)}`}>
                          Vish: {ingredient.food.vishScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Recipe Tips</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {recipeAnalysis.scores.nutrition < 70 && (
                      <li>• Consider adding more vegetables or whole grains to boost nutrition</li>
                    )}
                    {recipeAnalysis.nutrition.sodium > 800 && (
                      <li>• Try reducing salt and using herbs/spices for flavor instead</li>
                    )}
                    {recipeAnalysis.nutrition.sugar > 20 && (
                      <li>• Consider reducing added sugars or using natural sweeteners</li>
                    )}
                    {recipeAnalysis.nutrition.fiber < 5 && (
                      <li>• Add more fiber-rich ingredients like beans, vegetables, or whole grains</li>
                    )}
                    <li>• Homemade recipes are generally healthier than processed alternatives!</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ChefHat className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Build Your Recipe
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Add ingredients and analyze your homemade recipe's Vish Score
                  </p>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 max-w-sm mx-auto">
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      💡 <strong>Tip:</strong> Use the search function to find exact nutrition data for your ingredients.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};