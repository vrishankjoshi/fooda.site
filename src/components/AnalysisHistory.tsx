Here's the fixed version with all missing closing brackets added:

```typescript
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

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ isOpen, onClose }) => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'healthy' | 'unhealthy' | 'recent' | 'indian'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [showStats, setShowStats] = useState(true);

  // Load analysis history from localStorage
  useEffect(() => {
    const loadAnalysisHistory = () => {
      try {
        const stored = localStorage.getItem('foodcheck_analysis_history');
        if (stored) {
          const history = JSON.parse(stored);
          setAnalyses(history);
          setFilteredAnalyses(history);
          calculateStats(history);
        } else {
          // Generate comprehensive sample data including popular Indian foods
          const sampleData = generateComprehensiveSampleData();
          setAnalyses(sampleData);
          setFilteredAnalyses(sampleData);
          calculateStats(sampleData);
          localStorage.setItem('foodcheck_analysis_history', JSON.stringify(sampleData));
        }
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
        filtered = filtered.filter(analysis => 
          analysis.foodName.toLowerCase().includes('atta') ||
          analysis.foodName.toLowerCase().includes('frooti') ||
          analysis.foodName.toLowerCase().includes('besan') ||
          analysis.foodName.toLowerCase().includes('lassi') ||
          analysis.foodName.toLowerCase().includes('rajma') ||
          analysis.foodName.toLowerCase().includes('chole') ||
          analysis.foodName.toLowerCase().includes('parle') ||
          analysis.foodName.toLowerCase().includes('haldiram') ||
          analysis.foodName.toLowerCase().includes('bikaji') ||
          analysis.foodName.toLowerCase().includes('amul') ||
          analysis.foodName.toLowerCase().includes('ragi') ||
          analysis.foodName.toLowerCase().includes('jowar') ||
          analysis.foodName.toLowerCase().includes('khakhra') ||
          analysis.foodName.toLowerCase().includes('bhujia') ||
          analysis.foodName.toLowerCase().includes('gulab jamun') ||
          analysis.foodName.toLowerCase().includes('rasgulla') ||
          analysis.foodName.toLowerCase().includes('nimbu paani') ||
          analysis.foodName.toLowerCase().includes('pickle') ||
          analysis.foodName.toLowerCase().includes('chutney') ||
          analysis.foodName.toLowerCase().includes('indian')
        );
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

  const generateComprehensiveSampleData = (): AnalysisRecord[] => {
    const sampleFoods = [
      // 🇮🇳 POPULAR INDIAN FOODS 🇮🇳
      { 
        name: 'Aashirvaad Whole Wheat Atta', 
        score: 88, 
        nutrition: 92, 
        taste: 78, 
        consumer: 95,
        category: 'Indian Flour',
        notes: 'Perfect for making rotis and parathas'
      },
      { 
        name: 'Parle Frooti Mango Drink', 
        score: 65, 
        nutrition: 35, 
        taste: 92, 
        consumer: 88,
        category: 'Indian Beverage',
        notes: 'Childhood favorite mango drink'
      },
      { 
        name: 'Everest Besan (Chickpea Flour)', 
        score: 85, 
        nutrition: 90, 
        taste: 75, 
        consumer: 90,
        category: 'Indian Flour',
        notes: 'Great for making pakoras and dhokla'
      },
      { 
        name: 'Amul Sweet Lassi', 
        score: 78, 
        nutrition: 68, 
        taste: 88, 
        consumer: 78,
        category: 'Indian Beverage',
        notes: 'Refreshing traditional yogurt drink'
      },
      { 
        name: 'MTR Ready to Eat Rajma', 
        score: 82, 
        nutrition: 85, 
        taste: 80, 
        consumer: 82,
        category: 'Indian Ready-to-Eat',
        notes: 'Convenient and tasty kidney bean curry'
      },
      { 
        name: 'Haldiram\'s Namkeen Mixture', 
        score: 58, 
        nutrition: 45, 
        taste: 85, 
        consumer: 75,
        category: 'Indian Snacks',
        notes: 'Spicy and crunchy snack mix'
      },
      { 
        name: 'Parle-G Glucose Biscuits', 
        score: 62, 
        nutrition: 48, 
        taste: 75, 
        consumer: 92,
        category: 'Indian Biscuits',
        notes: 'Classic tea-time biscuits'
      },
      { 
        name: 'Organic India Ragi Flour', 
        score: 92, 
        nutrition: 95, 
        taste: 72, 
        consumer: 78,
        category: 'Indian Flour',
        notes: 'Highly nutritious finger millet flour'
      },
      { 
        name: 'Bikaji Aloo Bhujia', 
        score: 55, 
        nutrition: 38, 
        taste: 88, 
        consumer: 82,
        category: 'Indian Snacks',
        notes: 'Crispy potato-based snack'
      },
      { 
        name: 'Lijjat Methi Khakhra', 
        score: 78, 
        nutrition: 82, 
        taste: 75, 
        consumer: 78,
        category: 'Indian Snacks',
        notes: 'Healthy fenugreek crackers'
      },
      { 
        name: 'ITC Aashirvaad Ready Chole', 
        score: 85, 
        nutrition: 88, 
        taste: 82, 
        consumer: 85,
        category: 'Indian Ready-to-Eat',
        notes: 'Delicious chickpea curry'
      },
      { 
        name: 'Haldiram\'s Gulab Jamun', 
        score: 45, 
        nutrition: 25, 
        taste: 95, 
        consumer: 88,
        category: 'Indian Sweets',
        notes: 'Traditional milk-based sweet'
      },
      { 
        name: 'Real Nimbu Paani', 
        score: 68, 
        nutrition: 55, 
        taste: 78, 
        consumer: 72,
        category: 'Indian Beverage',
        notes: 'Refreshing lemon water drink'
      },
      { 
        name: 'Patanjali Jowar Flour', 
        score: 88, 
        nutrition: 92, 
        taste: 75, 
        consumer: 78,
        category: 'Indian Flour',
        notes: 'Gluten-free sorghum flour'
      },
      { 
        name: 'Britannia Marie Gold', 
        score: 58, 
        nutrition: 48, 
        taste: 72, 
        consumer: 85,
        category: 'Indian Biscuits',
        notes: 'Light and crispy tea biscuits'
      },
      { 
        name: 'Priya Mango Pickle', 
        score: 65, 
        nutrition: 55, 
        taste: 88, 
        consumer: 82,
        category: 'Indian Condiments',
        notes: 'Tangy and spicy mango pickle'
      },
      { 
        name: 'Bengali Sweet House Rasgulla', 
        score: 52, 
        nutrition: 35, 
        taste: 85, 
        consumer: 78,
        category: 'Indian Sweets',
        notes: 'Soft and spongy milk sweet'
      },
      { 
        name: 'Kissan Mint Chutney', 
        score: 72, 
        nutrition: 62, 
        taste: 85, 
        consumer: 75,
        category: 'Indian Condiments',
        notes: 'Fresh mint flavor condiment'
      },
      { 
        name: '24 Mantra Organic Rice Flour', 
        score: 82, 
        nutrition: 78, 
        taste: 75, 
        consumer: 82,
        category: 'Indian Flour',
        notes: 'Organic and gluten-free'
      },

      // INTERNATIONAL FOODS
      { 
        name: 'Organic Granola Bar', 
        score: 85, 
        nutrition: 88, 
        taste: 82, 
        consumer: 85,
        category: 'Snack Bars',
        notes: 'Healthy breakfast option'
      },
      { 
        name: 'Instant Ramen Noodles', 
        score: 35, 
        nutrition: 25, 
        taste: 55, 
        consumer: 25,
        category: 'Instant Food',
        notes: 'Quick but not very healthy'
      },
      { 
        name: 'Greek Yogurt', 
        score: 92, 
        nutrition: 95, 
        taste: 88, 
        consumer: 93,
        category: 'Dairy',
        notes: 'High protein and probiotics'
      },
      { 
        name: 'Potato Chips', 
        score: 28, 
        nutrition: 15, 
        taste: 45, 
        consumer: 25,
        category: 'Snacks',
        notes: 'Tasty but unhealthy'
      },
      { 
        name: 'Whole Grain Cereal', 
        score: 78, 
        nutrition: 85, 
        taste: 70, 
        consumer: 80,
        category: 'Breakfast',
        notes: 'Good fiber content'
      },
      { 
        name: 'Energy Drink', 
        score: 22, 
        nutrition: 10, 
        taste: 35, 
        consumer: 20,
        category: 'Beverages',
        notes: 'High caffeine and sugar'
      },
      { 
        name: 'Protein Bar', 
        score: 75, 
        nutrition: 80, 
        taste: 68, 
        consumer: 77,
        category: 'Fitness',
        notes: 'Post-workout snack'
      },
      { 
        name: 'Frozen Pizza', 
        score: 45, 
        nutrition: 35, 
        taste: 65, 
        consumer: 35,
        category: 'Frozen Food',
        notes: 'Convenient but processed'
      },
      { 
        name: 'Almond Milk', 
        score: 88, 
        nutrition: 90, 
        taste: 85, 
        consumer: 90,
        category: 'Plant-based',
        notes: 'Great dairy alternative'
      },
      { 
        name: 'Dark Chocolate Bar', 
        score: 68, 
        nutrition: 65, 
        taste: 85, 
        consumer: 78,
        category: 'Confectionery',
        notes: 'Antioxidant-rich treat'
      }
    ];

    return sampleFoods.map((food, index) => ({
      id: `analysis-${index + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(), // Random time within last 60 days
      foodName: food.name,
      analysis: {
        nutrition: {
          calories: Math.floor(Math.random() * 400) + 100,
          totalFat: `${Math.floor(Math.random() * 20) + 2}g`,
          saturatedFat: `${Math.floor(Math.random() * 8) + 1}g`,
          transFat: '0g',
          cholesterol: `${Math.floor(Math.random() * 50)}mg`,
          sodium: `${Math.floor(Math.random() * 800) + 100}mg`,
          totalCarbohydrates: `${Math.floor(Math.random() * 40) + 10}g`,
          dietaryFiber: `${Math.floor(Math.random() * 8) + 1}g`,
          totalSugars: `${Math.floor(Math.random() * 20) + 2}g`,
          addedSugars: `${Math.floor(Math.random() * 15)}g`,
          protein: `${Math.floor(Math.random() * 20) + 3}g`,
          vitamins: food.category.includes('Indian') ? 
            ['Vitamin B1', 'Iron', 'Folate', 'Magnesium'] : 
            ['Vitamin C', 'Iron', 'Calcium']
        },
        health: {
          score: food.nutrition,
          warnings: food.nutrition < 50 ? 
            (food.category.includes('Indian') ? 
              ['High sodium content', 'Contains preservatives'] : 
              ['High sodium content', 'Low nutritional value']) : [],
          recommendations: food.category.includes('Indian') ? 
            ['Enjoy in moderation', 'Pair with fresh vegetables', 'Great source of traditional nutrients'] :
            ['Consider portion size', 'Pair with fruits or vegetables'],
          allergens: food.category.includes('Indian') ? 
            ['May contain gluten', 'Contains spices'] : 
            ['May contain nuts', 'Contains gluten']
        },
        taste: {
          score: food.taste,
          profile: food.category.includes('Indian') ? 
            ['Authentic', 'Spicy', 'Traditional', 'Aromatic'] :
            ['Sweet', 'Crunchy', 'Satisfying'],
          description: food.category.includes('Indian') ? 
            'Rich traditional flavors with authentic Indian spices and ingredients.' :
            'Pleasant taste with good texture and flavor balance.'
        },
        consumer: {
          score: food.consumer,
          feedback: food.category.includes('Indian') ? 
            'Highly appreciated for authentic taste and cultural connection' :
            'Generally well-received by consumers',
          satisfaction: food.consumer >= 70 ? 'High' : food.consumer >= 50 ? 'Medium' : 'Low',
          commonComplaints: food.consumer < 50 ? 
            (food.category.includes('Indian') ? 
              ['Too spicy for some', 'Strong flavors'] : 
              ['Too processed', 'Artificial taste']) : [],
          positiveAspects: food.category.includes('Indian') ? 
            ['Authentic taste', 'Cultural value', 'Traditional recipe', 'Good quality'] :
            ['Convenient', 'Good value', 'Tasty']
        },
        overall: {
          grade: food.score >= 80 ? 'A' : food.score >= 60 ? 'B' : food.score >= 40 ? 'C' : 'D',
          summary: food.category.includes('Indian') ? 
            `${food.score >= 70 ? 'Excellent' : food.score >= 50 ? 'Good' : 'Average'} traditional Indian food with authentic flavors.` :
            `Overall ${food.score >= 70 ? 'good' : food.score >= 50 ? 'average' : 'poor'} choice for health and taste.`,
          vishScore: food.score
        }
      },
      userNotes: food.notes
    }));
  };

  const calculateStats = (analysisData: AnalysisRecord[]) => {
    if (analysisData.length === 0) {
      setStats(null);
      return;
    }

    const totalAnalyses = analysisData.length;
    const averageVishScore = Math.round(
      analysisData.reduce((sum, a) => sum + a.analysis.overall.vishScore, 0) / totalAnalyses
    );
    const averageNutritionScore = Math.round(
      analysisData.reduce((sum, a) => sum + a.analysis.health.score, 0) / totalAnalyses
    );
    const averageTasteScore = Math.round(
      analysisData.reduce((sum, a) => sum + a.analysis.taste.score, 0) / totalAnalyses
    );
    const averageConsumerScore = Math.round(
      analysisData.reduce((sum, a) => sum + a.analysis.consumer.score, 0) / totalAnalyses
    );
    const healthyChoices = analysisData.filter(a => a.analysis.overall.vishScore >= 70).length;

    // Calculate improvement trend (simplified)
    const recentAnalyses = analysisData.slice(0, Math.min(5, totalAnalyses));
    const olderAnalyses = analysisData.slice(-Math.min(5, totalAnalyses));
    const recentAvg = recentAnalyses.reduce((sum, a) => sum + a.analysis.overall.vishScore, 0) / recentAnalyses.length;
    const olderAvg = olderAnalyses.reduce((sum, a) => sum + a.analysis.overall.vishScore, 0) / olderAnalyses.length;
    const improvementTrend = Math.round(recentAvg - olderAvg);

    // Top categories including Indian foods
    const categories = analysisData.reduce((acc, analysis) => {
      const score = analysis.analysis.overall.vishScore;
      const isIndian = analysis.foodName.toLowerCase().includes('atta') ||
                      analysis.foodName.toLowerCase().includes('frooti') ||
                      analysis.foodName.toLowerCase().includes('besan') ||
                      analysis.foodName.toLowerCase().includes('indian') ||
                      analysis.foodName.toLowerCase().includes('parle') ||
                      analysis.foodName.toLowerCase().includes('haldiram') ||
                      analysis.foodName.toLowerCase().includes('amul');
      
      const category = isIndian ? 'Indian Foods' : 
                     score >= 70 ? 'Healthy' : 
                     score >= 50 ? 'Moderate' : 'Unhealthy';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Monthly analyses (last 6 months)
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    analysisData.forEach(analysis => {
      const date = new Date(analysis.timestamp);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey]++;
      }
    });

    const monthlyAnalyses = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));

    setStats({
      totalAnalyses,
      averageVishScore,
      averageNutritionScore,
      averageTasteScore,
      averageConsumerScore,
      healthyChoices,
      improvementTrend,
      topCategories,
      monthlyAnalyses
    });
  };

  const deleteAnalysis = (id: string) => {
    const updatedAnalyses = analyses.filter(a => a.id !== id);
    setAnalyses(updatedAnalyses);
    localStorage.setItem('foodcheck_analysis_history', JSON.stringify(updatedAnalyses));
    calculateStats(updatedAnalyses);
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Food Name', 'Vish Score', 'Nutrition Score', 'Taste Score', 'Consumer Score', 'Grade', 'Notes'],
      ...analyses.map(analysis => [
        new Date(analysis.timestamp).toLocaleDateString(),
        analysis.foodName,
        analysis.analysis.overall.vishScore,
        analysis.analysis.health.score,
        analysis.analysis.taste.score,
        analysis.analysis.consumer.score,
        analysis.analysis.overall.grade,
        analysis.userNotes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodcheck-analysis-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'B': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'C': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'D': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'F': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Food Analysis History</h2>
                <p className="text-green-100">Track your food choices and health journey including popular Indian foods</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full hover:bg-opacity-30 transition-colors flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>{showStats ? 'Hide' : 'Show'} Stats</span>
              </button>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Statistics Sidebar */}
          {showStats && stats && (
            <div className="w-80 bg-gray-50 dark:bg-gray-700 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Your Food Journey
              </h3>

              {/* Key Stats */}
              <div className="space-y-4 mb-6">
                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Analyses</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAnalyses}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Average Vish Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(stats.averageVishScore)}`}>
                      {stats.averageVishScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${stats.averageVishScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Healthy Choices</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {stats.healthyChoices}/{stats.totalAnalyses}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((stats.healthyChoices / stats.totalAnalyses) * 100)}% healthy
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Improvement Trend</span>
                    <span className={`text-lg font-bold ${stats.improvementTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend}
                    </span>