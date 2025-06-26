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
          analysis.foodName.toLowerCase().includes('indian') ||
          analysis.foodName.toLowerCase().includes('masala') ||
          analysis.foodName.toLowerCase().includes('samosa') ||
          analysis.foodName.toLowerCase().includes('pakora') ||
          analysis.foodName.toLowerCase().includes('namkeen') ||
          analysis.foodName.toLowerCase().includes('mixture') ||
          analysis.foodName.toLowerCase().includes('biscuit') ||
          analysis.foodName.toLowerCase().includes('marie') ||
          analysis.foodName.toLowerCase().includes('glucose')
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
      // 🇮🇳 POPULAR INDIAN FOODS 🇮🇳 - EXPANDED LIST
      { 
        name: 'Aashirvaad Whole Wheat Atta', 
        score: 88, 
        nutrition: 92, 
        taste: 78, 
        consumer: 95,
        category: 'Indian Flour',
        notes: 'Perfect for making rotis and parathas. High fiber content.'
      },
      { 
        name: 'Parle Frooti Mango Drink', 
        score: 65, 
        nutrition: 35, 
        taste: 92, 
        consumer: 88,
        category: 'Indian Beverage',
        notes: 'Childhood favorite mango drink. High sugar content.'
      },
      { 
        name: 'Everest Besan (Chickpea Flour)', 
        score: 85, 
        nutrition: 90, 
        taste: 75, 
        consumer: 90,
        category: 'Indian Flour',
        notes: 'Great for making pakoras and dhokla. High protein.'
      },
      { 
        name: 'Amul Sweet Lassi', 
        score: 78, 
        nutrition: 68, 
        taste: 88, 
        consumer: 78,
        category: 'Indian Beverage',
        notes: 'Refreshing traditional yogurt drink with probiotics.'
      },
      { 
        name: 'MTR Ready to Eat Rajma', 
        score: 82, 
        nutrition: 85, 
        taste: 80, 
        consumer: 82,
        category: 'Indian Ready-to-Eat',
        notes: 'Convenient and tasty kidney bean curry. Good protein source.'
      },
      { 
        name: 'Haldiram\'s Namkeen Mixture', 
        score: 58, 
        nutrition: 45, 
        taste: 85, 
        consumer: 75,
        category: 'Indian Snacks',
        notes: 'Spicy and crunchy snack mix. High sodium content.'
      },
      { 
        name: 'Parle-G Glucose Biscuits', 
        score: 62, 
        nutrition: 48, 
        taste: 75, 
        consumer: 92,
        category: 'Indian Biscuits',
        notes: 'Classic tea-time biscuits. Fortified with vitamins.'
      },
      { 
        name: 'Organic India Ragi Flour', 
        score: 92, 
        nutrition: 95, 
        taste: 72, 
        consumer: 78,
        category: 'Indian Flour',
        notes: 'Highly nutritious finger millet flour. Rich in calcium.'
      },
      { 
        name: 'Bikaji Aloo Bhujia', 
        score: 55, 
        nutrition: 38, 
        taste: 88, 
        consumer: 82,
        category: 'Indian Snacks',
        notes: 'Crispy potato-based snack. Very popular but high in oil.'
      },
      { 
        name: 'Lijjat Methi Khakhra', 
        score: 78, 
        nutrition: 82, 
        taste: 75, 
        consumer: 78,
        category: 'Indian Snacks',
        notes: 'Healthy fenugreek crackers. Good source of fiber.'
      },
      { 
        name: 'ITC Aashirvaad Ready Chole', 
        score: 85, 
        nutrition: 88, 
        taste: 82, 
        consumer: 85,
        category: 'Indian Ready-to-Eat',
        notes: 'Delicious chickpea curry. High protein and fiber.'
      },
      { 
        name: 'Haldiram\'s Gulab Jamun', 
        score: 45, 
        nutrition: 25, 
        taste: 95, 
        consumer: 88,
        category: 'Indian Sweets',
        notes: 'Traditional milk-based sweet. Very high sugar content.'
      },
      { 
        name: 'Real Nimbu Paani', 
        score: 68, 
        nutrition: 55, 
        taste: 78, 
        consumer: 72,
        category: 'Indian Beverage',
        notes: 'Refreshing lemon water drink. Good vitamin C source.'
      },
      { 
        name: 'Patanjali Jowar Flour', 
        score: 88, 
        nutrition: 92, 
        taste: 75, 
        consumer: 78,
        category: 'Indian Flour',
        notes: 'Gluten-free sorghum flour. Rich in antioxidants.'
      },
      { 
        name: 'Britannia Marie Gold', 
        score: 58, 
        nutrition: 48, 
        taste: 72, 
        consumer: 85,
        category: 'Indian Biscuits',
        notes: 'Light and crispy tea biscuits. Moderate sugar content.'
      },
      { 
        name: 'Priya Mango Pickle', 
        score: 65, 
        nutrition: 55, 
        taste: 88, 
        consumer: 82,
        category: 'Indian Condiments',
        notes: 'Tangy and spicy mango pickle. High sodium content.'
      },
      { 
        name: 'Bengali Sweet House Rasgulla', 
        score: 52, 
        nutrition: 35, 
        taste: 85, 
        consumer: 78,
        category: 'Indian Sweets',
        notes: 'Soft and spongy milk sweet. Very high sugar content.'
      },
      { 
        name: 'Kissan Mint Chutney', 
        score: 72, 
        nutrition: 62, 
        taste: 85, 
        consumer: 75,
        category: 'Indian Condiments',
        notes: 'Fresh mint flavor condiment. Contains preservatives.'
      },
      { 
        name: '24 Mantra Organic Rice Flour', 
        score: 82, 
        nutrition: 78, 
        taste: 75, 
        consumer: 82,
        category: 'Indian Flour',
        notes: 'Organic and gluten-free. Good for South Indian dishes.'
      },
      { 
        name: 'Tata Tea Premium', 
        score: 75, 
        nutrition: 70, 
        taste: 85, 
        consumer: 90,
        category: 'Indian Beverages',
        notes: 'Strong black tea blend. Rich in antioxidants.'
      },
      { 
        name: 'Maggi 2-Minute Masala Noodles', 
        score: 45, 
        nutrition: 30, 
        taste: 80, 
        consumer: 95,
        category: 'Indian Instant Food',
        notes: 'Popular instant noodles. High sodium and preservatives.'
      },
      { 
        name: 'Amul Butter', 
        score: 70, 
        nutrition: 60, 
        taste: 90, 
        consumer: 95,
        category: 'Indian Dairy',
        notes: 'Classic Indian butter. High saturated fat content.'
      },
      { 
        name: 'Haldiram\'s Soan Papdi', 
        score: 48, 
        nutrition: 30, 
        taste: 85, 
        consumer: 88,
        category: 'Indian Sweets',
        notes: 'Flaky sweet confection. Very high sugar and fat.'
      },
      { 
        name: 'Kurkure Masala Munch', 
        score: 42, 
        nutrition: 25, 
        taste: 88, 
        consumer: 85,
        category: 'Indian Snacks',
        notes: 'Crunchy corn snack. High in artificial flavors.'
      },
      { 
        name: 'Dabur Honey', 
        score: 85, 
        nutrition: 80, 
        taste: 90, 
        consumer: 88,
        category: 'Indian Natural Products',
        notes: 'Pure honey. Natural sweetener with antioxidants.'
      },
      { 
        name: 'Bru Instant Coffee', 
        score: 68, 
        nutrition: 55, 
        taste: 82, 
        consumer: 85,
        category: 'Indian Beverages',
        notes: 'Popular instant coffee blend. Moderate caffeine content.'
      },
      { 
        name: 'Patanjali Chyawanprash', 
        score: 78, 
        nutrition: 85, 
        taste: 65, 
        consumer: 75,
        category: 'Indian Health Products',
        notes: 'Ayurvedic health supplement. Rich in vitamin C.'
      },
      { 
        name: 'Haldiram\'s Moong Dal', 
        score: 72, 
        nutrition: 80, 
        taste: 75, 
        consumer: 78,
        category: 'Indian Snacks',
        notes: 'Fried lentil snack. Good protein but high oil content.'
      },
      { 
        name: 'Amul Ice Cream Kulfi', 
        score: 55, 
        nutrition: 40, 
        taste: 92, 
        consumer: 90,
        category: 'Indian Desserts',
        notes: 'Traditional Indian ice cream. High sugar and fat.'
      },
      { 
        name: 'Catch Garam Masala', 
        score: 88, 
        nutrition: 85, 
        taste: 95, 
        consumer: 85,
        category: 'Indian Spices',
        notes: 'Aromatic spice blend. Rich in antioxidants and flavor.'
      },

      // INTERNATIONAL FOODS
      { 
        name: 'Organic Granola Bar', 
        score: 85, 
        nutrition: 88, 
        taste: 82, 
        consumer: 85,
        category: 'Snack Bars',
        notes: 'Healthy breakfast option with nuts and oats.'
      },
      { 
        name: 'Instant Ramen Noodles', 
        score: 35, 
        nutrition: 25, 
        taste: 55, 
        consumer: 25,
        category: 'Instant Food',
        notes: 'Quick but not very healthy. High sodium content.'
      },
      { 
        name: 'Greek Yogurt', 
        score: 92, 
        nutrition: 95, 
        taste: 88, 
        consumer: 93,
        category: 'Dairy',
        notes: 'High protein and probiotics. Excellent health benefits.'
      },
      { 
        name: 'Potato Chips', 
        score: 28, 
        nutrition: 15, 
        taste: 45, 
        consumer: 25,
        category: 'Snacks',
        notes: 'Tasty but unhealthy. High fat and sodium.'
      },
      { 
        name: 'Whole Grain Cereal', 
        score: 78, 
        nutrition: 85, 
        taste: 70, 
        consumer: 80,
        category: 'Breakfast',
        notes: 'Good fiber content. Fortified with vitamins.'
      },
      { 
        name: 'Energy Drink', 
        score: 22, 
        nutrition: 10, 
        taste: 35, 
        consumer: 20,
        category: 'Beverages',
        notes: 'High caffeine and sugar. Not recommended daily.'
      },
      { 
        name: 'Protein Bar', 
        score: 75, 
        nutrition: 80, 
        taste: 68, 
        consumer: 77,
        category: 'Fitness',
        notes: 'Post-workout snack. Good protein content.'
      },
      { 
        name: 'Frozen Pizza', 
        score: 45, 
        nutrition: 35, 
        taste: 65, 
        consumer: 35,
        category: 'Frozen Food',
        notes: 'Convenient but processed. High sodium and preservatives.'
      },
      { 
        name: 'Almond Milk', 
        score: 88, 
        nutrition: 90, 
        taste: 85, 
        consumer: 90,
        category: 'Plant-based',
        notes: 'Great dairy alternative. Low calories and fortified.'
      },
      { 
        name: 'Dark Chocolate Bar', 
        score: 68, 
        nutrition: 65, 
        taste: 85, 
        consumer: 78,
        category: 'Confectionery',
        notes: 'Antioxidant-rich treat. Moderate sugar content.'
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
                      analysis.foodName.toLowerCase().includes('amul') ||
                      analysis.foodName.toLowerCase().includes('masala') ||
                      analysis.foodName.toLowerCase().includes('namkeen') ||
                      analysis.foodName.toLowerCase().includes('mixture') ||
                      analysis.foodName.toLowerCase().includes('biscuit');
      
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
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white dark:bg-gray-600 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Food Categories</h4>
                <div className="space-y-2">
                  {stats.topCategories.map((category, index) => (
                    <div key={category.name} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{category.name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={exportData}
                disabled={analyses.length === 0}
                className="w-full bg-gray-600 dark:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-400 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search food items..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300"
                >
                  <option value="all">All Foods</option>
                  <option value="indian">🇮🇳 Indian Foods</option>
                  <option value="healthy">Healthy (70+ Score)</option>
                  <option value="unhealthy">Needs Improvement (&lt;50)</option>
                  <option value="recent">Recent (Last Week)</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            {/* Analysis List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {searchTerm || filterBy !== 'all' ? 'No matching analyses found' : 'No analyses yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filterBy !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Start analyzing food to see your history here.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {analysis.foodName}
                            {(analysis.foodName.toLowerCase().includes('indian') ||
                              analysis.foodName.toLowerCase().includes('atta') ||
                              analysis.foodName.toLowerCase().includes('frooti') ||
                              analysis.foodName.toLowerCase().includes('besan') ||
                              analysis.foodName.toLowerCase().includes('parle') ||
                              analysis.foodName.toLowerCase().includes('haldiram') ||
                              analysis.foodName.toLowerCase().includes('amul') ||
                              analysis.foodName.toLowerCase().includes('masala') ||
                              analysis.foodName.toLowerCase().includes('namkeen')) && (
                              <span className="ml-2 text-orange-500">🇮🇳</span>
                            )}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(analysis.timestamp).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(analysis.analysis.overall.grade)}`}>
                              Grade {analysis.analysis.overall.grade}
                            </span>
                          </div>
                          {analysis.userNotes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                              "{analysis.userNotes}"
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-3xl font-bold ${getScoreColor(analysis.analysis.overall.vishScore)}`}>
                            {analysis.analysis.overall.vishScore}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Vish Score</div>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Nutrition</span>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(analysis.analysis.health.score)}`}>
                            {analysis.analysis.health.score}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Star className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Taste</span>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(analysis.analysis.taste.score)}`}>
                            {analysis.analysis.taste.score}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-1" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Consumer</span>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(analysis.analysis.consumer.score)}`}>
                            {analysis.analysis.consumer.score}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => setSelectedAnalysis(analysis)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => deleteAnalysis(analysis.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedAnalysis.foodName}
                  {(selectedAnalysis.foodName.toLowerCase().includes('indian') ||
                    selectedAnalysis.foodName.toLowerCase().includes('atta') ||
                    selectedAnalysis.foodName.toLowerCase().includes('frooti') ||
                    selectedAnalysis.foodName.toLowerCase().includes('besan') ||
                    selectedAnalysis.foodName.toLowerCase().includes('parle') ||
                    selectedAnalysis.foodName.toLowerCase().includes('haldiram') ||
                    selectedAnalysis.foodName.toLowerCase().includes('amul') ||
                    selectedAnalysis.foodName.toLowerCase().includes('masala') ||
                    selectedAnalysis.foodName.toLowerCase().includes('namkeen')) && (
                    <span className="ml-2 text-orange-500">🇮🇳</span>
                  )}
                </h3>
                <button
                  onClick={() => setSelectedAnalysis(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Overall Score */}
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold ${getScoreColor(selectedAnalysis.analysis.overall.vishScore)} mb-2`}>
                  {selectedAnalysis.analysis.overall.vishScore}/100
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-300">Vish Score</div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{selectedAnalysis.analysis.overall.summary}</p>
              </div>

              {/* Detailed breakdown would go here */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Nutrition Analysis
                  </h4>
                  <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis.health.score)} mb-2`}>
                    {selectedAnalysis.analysis.health.score}/100
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>Calories: {selectedAnalysis.analysis.nutrition.calories}</p>
                    <p>Protein: {selectedAnalysis.analysis.nutrition.protein}</p>
                    <p>Fiber: {selectedAnalysis.analysis.nutrition.dietaryFiber}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Taste Profile
                  </h4>
                  <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis.taste.score)} mb-2`}>
                    {selectedAnalysis.analysis.taste.score}/100
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>{selectedAnalysis.analysis.taste.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedAnalysis.analysis.taste.profile.map((trait, index) => (
                        <span key={index} className="bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Consumer Rating
                  </h4>
                  <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis.consumer.score)} mb-2`}>
                    {selectedAnalysis.analysis.consumer.score}/100
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>Satisfaction: {selectedAnalysis.analysis.consumer.satisfaction}</p>
                    <p className="mt-1">{selectedAnalysis.analysis.consumer.feedback}</p>
                  </div>
                </div>
              </div>

              {/* Warnings and Recommendations */}
              {selectedAnalysis.analysis.health.warnings.length > 0 && (
                <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                    Health Warnings
                  </h4>
                  <ul className="space-y-1">
                    {selectedAnalysis.analysis.health.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                        <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAnalysis.analysis.health.recommendations.length > 0 && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {selectedAnalysis.analysis.health.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};