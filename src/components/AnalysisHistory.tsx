import React, { useState, useEffect } from 'react';
import { X, BarChart3, Calendar, TrendingUp, Award, Heart, Star, Users, Filter, Download, Search, Clock, CheckCircle, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { NutritionAnalysis } from '../services/visionService';

interface AnalysisRecord {
  id: string;
  timestamp: string;
  foodName: string;
  analysis: NutritionAnalysis;
  imageUrl?: string;
  userNotes?: string;
  isIndian?: boolean;
  isAmerican?: boolean;
}

interface AnalysisHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalysisStats {
  totalAnalyses: number;
  averageVishScore: number;
  averageNutritionScore: number;
  averageTasteScore: number;
  averageConsumerScore: number;
  healthyChoices: number;
  improvementTrend: number;
  topCategories: { name: string; count: number }[];
  monthlyAnalyses: { month: string; count: number }[];
}

const generateComprehensiveSampleData = (): AnalysisRecord[] => {
  const popularAmericanFoods = [
    // Fast Food Classics
    {
      name: "Big Mac",
      brand: "McDonald's",
      vishScore: 72,
      nutritionScore: 35,
      tasteScore: 88,
      consumerScore: 92,
      isAmerican: true
    },
    {
      name: "Whopper",
      brand: "Burger King",
      vishScore: 68,
      nutritionScore: 32,
      tasteScore: 85,
      consumerScore: 88,
      isAmerican: true
    },
    {
      name: "Original Recipe Chicken",
      brand: "KFC",
      vishScore: 77,
      nutritionScore: 55,
      tasteScore: 90,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Pepperoni Pizza",
      brand: "Domino's",
      vishScore: 76,
      nutritionScore: 45,
      tasteScore: 92,
      consumerScore: 90,
      isAmerican: true
    },
    {
      name: "Crunchy Taco",
      brand: "Taco Bell",
      vishScore: 72,
      nutritionScore: 50,
      tasteScore: 80,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Italian B.M.T.",
      brand: "Subway",
      vishScore: 74,
      nutritionScore: 55,
      tasteScore: 85,
      consumerScore: 82,
      isAmerican: true
    },

    // Beverages
    {
      name: "Coca-Cola Classic",
      brand: "Coca-Cola",
      vishScore: 65,
      nutritionScore: 15,
      tasteScore: 85,
      consumerScore: 95,
      isAmerican: true
    },
    {
      name: "Pepsi Cola",
      brand: "PepsiCo",
      vishScore: 61,
      nutritionScore: 12,
      tasteScore: 82,
      consumerScore: 90,
      isAmerican: true
    },
    {
      name: "Fairlife Whole Milk",
      brand: "Fairlife",
      vishScore: 88,
      nutritionScore: 92,
      tasteScore: 85,
      consumerScore: 87,
      isAmerican: true
    },
    {
      name: "Mountain Dew",
      brand: "PepsiCo",
      vishScore: 58,
      nutritionScore: 10,
      tasteScore: 88,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Red Bull Energy Drink",
      brand: "Red Bull",
      vishScore: 62,
      nutritionScore: 25,
      tasteScore: 78,
      consumerScore: 83,
      isAmerican: true
    },

    // Snacks
    {
      name: "Classic Potato Chips",
      brand: "Lay's",
      vishScore: 66,
      nutritionScore: 25,
      tasteScore: 85,
      consumerScore: 88,
      isAmerican: true
    },
    {
      name: "Nacho Cheese Doritos",
      brand: "Frito-Lay",
      vishScore: 70,
      nutritionScore: 28,
      tasteScore: 90,
      consumerScore: 92,
      isAmerican: true
    },
    {
      name: "Crunchy Cheetos",
      brand: "Frito-Lay",
      vishScore: 65,
      nutritionScore: 22,
      tasteScore: 88,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Original Pringles",
      brand: "Pringles",
      vishScore: 68,
      nutritionScore: 30,
      tasteScore: 85,
      consumerScore: 89,
      isAmerican: true
    },
    {
      name: "Goldfish Crackers",
      brand: "Pepperidge Farm",
      vishScore: 72,
      nutritionScore: 35,
      tasteScore: 88,
      consumerScore: 93,
      isAmerican: true
    },
    {
      name: "Ritz Crackers",
      brand: "Nabisco",
      vishScore: 69,
      nutritionScore: 32,
      tasteScore: 85,
      consumerScore: 90,
      isAmerican: true
    },

    // Breakfast Cereals
    {
      name: "Honey Nut Cheerios",
      brand: "General Mills",
      vishScore: 80,
      nutritionScore: 65,
      tasteScore: 85,
      consumerScore: 90,
      isAmerican: true
    },
    {
      name: "Frosted Flakes",
      brand: "Kellogg's",
      vishScore: 69,
      nutritionScore: 35,
      tasteScore: 88,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Lucky Charms",
      brand: "General Mills",
      vishScore: 67,
      nutritionScore: 30,
      tasteScore: 92,
      consumerScore: 88,
      isAmerican: true
    },
    {
      name: "Cinnamon Toast Crunch",
      brand: "General Mills",
      vishScore: 71,
      nutritionScore: 38,
      tasteScore: 95,
      consumerScore: 90,
      isAmerican: true
    },
    {
      name: "Corn Flakes",
      brand: "Kellogg's",
      vishScore: 75,
      nutritionScore: 55,
      tasteScore: 75,
      consumerScore: 85,
      isAmerican: true
    },

    // Desserts & Sweets
    {
      name: "Oreo Cookies",
      brand: "Nabisco",
      vishScore: 72,
      nutritionScore: 25,
      tasteScore: 95,
      consumerScore: 95,
      isAmerican: true
    },
    {
      name: "Vanilla Ice Cream",
      brand: "Ben & Jerry's",
      vishScore: 72,
      nutritionScore: 35,
      tasteScore: 92,
      consumerScore: 88,
      isAmerican: true
    },
    {
      name: "Chocolate Chip Cookies",
      brand: "Chips Ahoy!",
      vishScore: 68,
      nutritionScore: 28,
      tasteScore: 88,
      consumerScore: 88,
      isAmerican: true
    },
    {
      name: "Snickers Bar",
      brand: "Mars",
      vishScore: 70,
      nutritionScore: 32,
      tasteScore: 90,
      consumerScore: 88,
      isAmerican: true
    },
    {
      name: "Kit Kat",
      brand: "Hershey's",
      vishScore: 69,
      nutritionScore: 30,
      tasteScore: 88,
      consumerScore: 89,
      isAmerican: true
    },
    {
      name: "Reese's Peanut Butter Cups",
      brand: "Hershey's",
      vishScore: 73,
      nutritionScore: 35,
      tasteScore: 95,
      consumerScore: 90,
      isAmerican: true
    },

    // Healthier Options
    {
      name: "Greek Yogurt Plain",
      brand: "Chobani",
      vishScore: 83,
      nutritionScore: 95,
      tasteScore: 70,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Crunchy Granola Bar",
      brand: "Nature Valley",
      vishScore: 80,
      nutritionScore: 75,
      tasteScore: 80,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Protein Bar",
      brand: "Quest",
      vishScore: 82,
      nutritionScore: 85,
      tasteScore: 75,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Almond Butter",
      brand: "Justin's",
      vishScore: 85,
      nutritionScore: 88,
      tasteScore: 82,
      consumerScore: 85,
      isAmerican: true
    },

    // Condiments & Sauces
    {
      name: "Heinz Ketchup",
      brand: "Heinz",
      vishScore: 65,
      nutritionScore: 35,
      tasteScore: 85,
      consumerScore: 95,
      isAmerican: true
    },
    {
      name: "French's Yellow Mustard",
      brand: "French's",
      vishScore: 78,
      nutritionScore: 70,
      tasteScore: 80,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Hidden Valley Ranch",
      brand: "Hidden Valley",
      vishScore: 62,
      nutritionScore: 25,
      tasteScore: 88,
      consumerScore: 92,
      isAmerican: true
    },

    // Frozen Foods
    {
      name: "Hot Pockets",
      brand: "Nestlé",
      vishScore: 64,
      nutritionScore: 30,
      tasteScore: 82,
      consumerScore: 80,
      isAmerican: true
    },
    {
      name: "Lean Cuisine",
      brand: "Nestlé",
      vishScore: 75,
      nutritionScore: 65,
      tasteScore: 75,
      consumerScore: 85,
      isAmerican: true
    },
    {
      name: "Stouffer's Lasagna",
      brand: "Nestlé",
      vishScore: 71,
      nutritionScore: 45,
      tasteScore: 88,
      consumerScore: 80,
      isAmerican: true
    },

    // Some Indian Foods for variety
    {
      name: "Butter Chicken",
      brand: "Tasty Bite",
      vishScore: 78,
      nutritionScore: 60,
      tasteScore: 90,
      consumerScore: 85,
      isIndian: true
    },
    {
      name: "Basmati Rice",
      brand: "Tilda",
      vishScore: 80,
      nutritionScore: 75,
      tasteScore: 85,
      consumerScore: 80,
      isIndian: true
    },
    {
      name: "Naan Bread",
      brand: "Stonefire",
      vishScore: 72,
      nutritionScore: 50,
      tasteScore: 88,
      consumerScore: 78,
      isIndian: true
    }
  ];

  return popularAmericanFoods.map((food, index) => ({
    id: `analysis_${index + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    foodName: food.name,
    analysis: {
      overall: {
        vishScore: food.vishScore,
        nutritionScore: food.nutritionScore,
        tasteScore: food.tasteScore,
        consumerScore: food.consumerScore,
        summary: `Comprehensive analysis of ${food.name} by ${food.brand}`,
        recommendations: [`Enjoy ${food.name} in moderation as part of a balanced diet`],
        grade: food.vishScore >= 80 ? 'A' : food.vishScore >= 70 ? 'B' : food.vishScore >= 60 ? 'C' : food.vishScore >= 50 ? 'D' : 'F'
      },
      nutrition: {
        calories: Math.floor(Math.random() * 400) + 100,
        totalFat: `${Math.floor(Math.random() * 25) + 5}g`,
        saturatedFat: `${Math.floor(Math.random() * 10) + 2}g`,
        transFat: '0g',
        cholesterol: `${Math.floor(Math.random() * 50)}mg`,
        sodium: `${Math.floor(Math.random() * 800) + 200}mg`,
        totalCarbohydrates: `${Math.floor(Math.random() * 40) + 10}g`,
        dietaryFiber: `${Math.floor(Math.random() * 8) + 1}g`,
        totalSugars: `${Math.floor(Math.random() * 20) + 2}g`,
        addedSugars: `${Math.floor(Math.random() * 15)}g`,
        protein: `${Math.floor(Math.random() * 25) + 5}g`,
        vitamins: ['Vitamin A', 'Vitamin C', 'Iron']
      },
      health: {
        score: food.nutritionScore,
        warnings: food.nutritionScore < 50 ? ['High in calories', 'Contains processed ingredients'] : [],
        recommendations: ['Consume as part of a balanced diet', 'Consider portion sizes'],
        allergens: ['May contain milk', 'May contain wheat']
      },
      taste: {
        score: food.tasteScore,
        profile: ['Savory', 'Rich', 'Satisfying'],
        description: `${food.name} offers a classic American taste experience with balanced flavors.`
      },
      consumer: {
        score: food.consumerScore,
        feedback: `${food.brand} ${food.name} is widely loved by consumers for its consistent quality and taste.`,
        satisfaction: food.consumerScore >= 85 ? 'Very High' : food.consumerScore >= 70 ? 'High' : 'Moderate',
        commonComplaints: food.consumerScore < 80 ? ['Price concerns', 'Packaging issues'] : [],
        positiveAspects: ['Great taste', 'Convenient', 'Widely available', 'Consistent quality']
      }
    },
    imageUrl: `https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg`,
    userNotes: `Analyzed ${food.name} - ${food.brand}`,
    isIndian: food.isIndian || false,
    isAmerican: food.isAmerican || false
  }));
};

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ isOpen, onClose }) => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'healthy' | 'unhealthy' | 'recent' | 'indian' | 'american'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [showStats, setShowStats] = useState(true);

  const calculateStats = (analysisData: AnalysisRecord[]) => {
    if (analysisData.length === 0) return;

    const totalAnalyses = analysisData.length;
    const averageVishScore = analysisData.reduce((sum, a) => sum + a.analysis.overall.vishScore, 0) / totalAnalyses;
    const averageNutritionScore = analysisData.reduce((sum, a) => sum + a.analysis.overall.nutritionScore, 0) / totalAnalyses;
    const averageTasteScore = analysisData.reduce((sum, a) => sum + a.analysis.overall.tasteScore, 0) / totalAnalyses;
    const averageConsumerScore = analysisData.reduce((sum, a) => sum + a.analysis.overall.consumerScore, 0) / totalAnalyses;
    const healthyChoices = analysisData.filter(a => a.analysis.overall.vishScore >= 70).length;

    const categoryCount: { [key: string]: number } = {};
    analysisData.forEach(analysis => {
      if (analysis.isIndian) {
        categoryCount['Indian'] = (categoryCount['Indian'] || 0) + 1;
      }
      if (analysis.isAmerican) {
        categoryCount['American'] = (categoryCount['American'] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const monthlyData: { [key: string]: number } = {};
    analysisData.forEach(analysis => {
      const month = new Date(analysis.timestamp).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const monthlyAnalyses = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    setStats({
      totalAnalyses,
      averageVishScore: Math.round(averageVishScore),
      averageNutritionScore: Math.round(averageNutritionScore),
      averageTasteScore: Math.round(averageTasteScore),
      averageConsumerScore: Math.round(averageConsumerScore),
      healthyChoices,
      improvementTrend: 5,
      topCategories,
      monthlyAnalyses
    });
  };

  // Load analysis history from localStorage
  useEffect(() => {
    const loadAnalysisHistory = () => {
      try {
        const sampleData = generateComprehensiveSampleData();
        setAnalyses(sampleData);
        setFilteredAnalyses(sampleData);
        calculateStats(sampleData);
        
        localStorage.setItem('foodcheck_analysis_history', JSON.stringify(sampleData));
        
        console.log('📊 Generated comprehensive sample data:', sampleData.length, 'total foods');
        const indianCount = sampleData.filter(food => food.isIndian).length;
        const americanCount = sampleData.filter(food => food.isAmerican).length;
        console.log('🇮🇳 Indian foods:', indianCount);
        console.log('🇺🇸 American foods:', americanCount);
      } catch (error) {
        console.error('Error loading analysis history:', error);
        const sampleData = generateComprehensiveSampleData();
        setAnalyses(sampleData);
        setFilteredAnalyses(sampleData);
        calculateStats(sampleData);
      }
    };

    if (isOpen) {
      loadAnalysisHistory();
    }
  }, [isOpen]);

  // Filter and search analyses
  useEffect(() => {
    let filtered = [...analyses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(analysis =>
        analysis.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (analysis.userNotes && analysis.userNotes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'healthy':
        filtered = filtered.filter(analysis => analysis.analysis.overall.vishScore >= 70);
        break;
      case 'unhealthy':
        filtered = filtered.filter(analysis => analysis.analysis.overall.vishScore < 50);
        break;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(analysis => new Date(analysis.timestamp) >= oneWeekAgo);
        break;
      case 'indian':
        filtered = filtered.filter(analysis => analysis.isIndian === true);
        console.log('🇮🇳 Filtering for Indian foods, found:', filtered.length);
        break;
      case 'american':
        filtered = filtered.filter(analysis => analysis.isAmerican === true);
        console.log('🇺🇸 Filtering for American foods, found:', filtered.length);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'score':
          return b.analysis.overall.vishScore - a.analysis.overall.vishScore;
        case 'name':
          return a.foodName.localeCompare(b.foodName);
        default:
          return 0;
      }
    });

    setFilteredAnalyses(filtered);
  }, [analyses, searchTerm, filterBy, sortBy]);

  const deleteAnalysis = (id: string) => {
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    setAnalyses(updatedAnalyses);
    calculateStats(updatedAnalyses);
    localStorage.setItem('foodcheck_analysis_history', JSON.stringify(updatedAnalyses));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'foodcheck_analysis_history.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analysis History</h2>
              <p className="text-gray-600">Track your food analysis journey with popular American foods</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Stats Overview */}
        {showStats && stats && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Analyses</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Avg Vish Score</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageVishScore}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Healthy Choices</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.healthyChoices}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Improvement</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">+{stats.improvementTrend}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="healthy">Healthy (70+ Score)</option>
                <option value="unhealthy">Needs Improvement</option>
                <option value="recent">Recent (7 days)</option>
                <option value="indian">Indian Cuisine</option>
                <option value="american">American Cuisine</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Export */}
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Analysis List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {analysis.imageUrl && (
                          <img
                            src={analysis.imageUrl}
                            alt={analysis.foodName}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{analysis.foodName}</span>
                            {analysis.isIndian && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">🇮🇳 Indian</span>}
                            {analysis.isAmerican && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">🇺🇸 American</span>}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Award className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">{analysis.analysis.overall.vishScore}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(analysis.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedAnalysis(analysis)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAnalysis(analysis.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{selectedAnalysis.foodName}</h3>
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{selectedAnalysis.analysis.overall.vishScore}</p>
                  <p className="text-sm text-gray-600">Vish Score</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{selectedAnalysis.analysis.overall.nutritionScore}</p>
                  <p className="text-sm text-gray-600">Nutrition Score</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-700">{selectedAnalysis.analysis.overall.summary}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Analyzed on</h4>
                  <p className="text-gray-700">{new Date(selectedAnalysis.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};