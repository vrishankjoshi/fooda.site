import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Trash2, ChefHat, BarChart3, Target, ShoppingCart, Download } from 'lucide-react';
import { foodDatabaseService, FoodItem } from '../services/foodDatabaseService';

interface MealPlan {
  id: string;
  date: string;
  meals: {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snacks: FoodItem[];
  };
}

interface MealPlannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({ isOpen, onClose }) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [activeMeal, setActiveMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65
  });

  useEffect(() => {
    if (isOpen) {
      loadMealPlans();
      loadOrCreatePlanForDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  const loadMealPlans = () => {
    const saved = localStorage.getItem('foodcheck_meal_plans');
    if (saved) {
      setMealPlans(JSON.parse(saved));
    }
  };

  const saveMealPlans = (plans: MealPlan[]) => {
    setMealPlans(plans);
    localStorage.setItem('foodcheck_meal_plans', JSON.stringify(plans));
  };

  const loadOrCreatePlanForDate = (date: string) => {
    const existingPlan = mealPlans.find(plan => plan.date === date);
    if (existingPlan) {
      setCurrentPlan(existingPlan);
    } else {
      const newPlan: MealPlan = {
        id: Date.now().toString(),
        date,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        }
      };
      setCurrentPlan(newPlan);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await foodDatabaseService.searchFoods(searchQuery, 1, 10);
      setSearchResults(results.items);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const addFoodToMeal = (food: FoodItem) => {
    if (!currentPlan) return;

    const updatedPlan = {
      ...currentPlan,
      meals: {
        ...currentPlan.meals,
        [activeMeal]: [...currentPlan.meals[activeMeal], food]
      }
    };

    setCurrentPlan(updatedPlan);
    
    const updatedPlans = mealPlans.filter(p => p.id !== currentPlan.id);
    saveMealPlans([...updatedPlans, updatedPlan]);
    
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeFoodFromMeal = (mealType: keyof MealPlan['meals'], foodIndex: number) => {
    if (!currentPlan) return;

    const updatedMeals = {
      ...currentPlan.meals,
      [mealType]: currentPlan.meals[mealType].filter((_, index) => index !== foodIndex)
    };

    const updatedPlan = { ...currentPlan, meals: updatedMeals };
    setCurrentPlan(updatedPlan);
    
    const updatedPlans = mealPlans.filter(p => p.id !== currentPlan.id);
    saveMealPlans([...updatedPlans, updatedPlan]);
  };

  const calculateDayNutrition = () => {
    if (!currentPlan) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    Object.values(currentPlan.meals).flat().forEach(food => {
      totals.calories += food.nutrition.calories;
      totals.protein += food.nutrition.protein;
      totals.carbs += food.nutrition.carbohydrates;
      totals.fat += food.nutrition.fat;
    });

    return totals;
  };

  const generateShoppingList = () => {
    const allFoods = Object.values(currentPlan?.meals || {}).flat();
    const shoppingList = allFoods.map(food => `${food.name} (${food.brand})`).join('\n');
    
    const blob = new Blob([shoppingList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dayNutrition = calculateDayNutrition();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Meal Planner</h2>
                <p className="text-green-100">Plan healthy meals with Vish Score optimization</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Date Selector */}
          <div className="mt-4 flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
            />
            <button
              onClick={generateShoppingList}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Shopping List</span>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-160px)]">
          {/* Meal Planning */}
          <div className="w-2/3 p-6 overflow-y-auto">
            {/* Daily Nutrition Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Daily Nutrition</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Calories', current: Math.round(dayNutrition.calories), goal: nutritionGoals.calories, unit: 'cal' },
                  { label: 'Protein', current: Math.round(dayNutrition.protein), goal: nutritionGoals.protein, unit: 'g' },
                  { label: 'Carbs', current: Math.round(dayNutrition.carbs), goal: nutritionGoals.carbs, unit: 'g' },
                  { label: 'Fat', current: Math.round(dayNutrition.fat), goal: nutritionGoals.fat, unit: 'g' }
                ].map((nutrient) => {
                  const percentage = (nutrient.current / nutrient.goal) * 100;
                  return (
                    <div key={nutrient.label} className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{nutrient.label}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {nutrient.current}/{nutrient.goal}{nutrient.unit}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meals */}
            <div className="space-y-6">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => (
                <div key={mealType} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {mealType}
                    </h4>
                    <button
                      onClick={() => setActiveMeal(mealType)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Food</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentPlan?.meals[mealType].map((food, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-600 rounded">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{food.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {food.nutrition.calories} cal • Vish: {food.vishScore}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFoodFromMeal(mealType, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {currentPlan?.meals[mealType].length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No foods added yet
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Food Search */}
          <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Add to {activeMeal}
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => addFoodToMeal(food)}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{food.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {food.brand} • {food.nutrition.calories} cal • Vish: {food.vishScore}
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition Goals */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Daily Goals</h4>
              <div className="space-y-2">
                {Object.entries(nutritionGoals).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setNutritionGoals({
                        ...nutritionGoals,
                        [key]: parseInt(e.target.value) || 0
                      })}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};