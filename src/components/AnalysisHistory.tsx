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
  const [filterBy, setFilterBy] = useState<'all' | 'healthy' | 'unhealthy' | 'recent'>('all');
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
          // Generate comprehensive sample data with popular brands
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
        analysis.userNotes?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const popularBrandFoods = [
      // Coca-Cola Products
      { name: 'Coca-Cola Classic', brand: 'Coca-Cola', score: 65, nutrition: 15, taste: 85, consumer: 95, category: 'Beverages' },
      { name: 'Diet Coke', brand: 'Coca-Cola', score: 66, nutrition: 35, taste: 75, consumer: 88, category: 'Beverages' },
      { name: 'Sprite', brand: 'Coca-Cola', score: 62, nutrition: 18, taste: 82, consumer: 85, category: 'Beverages' },
      { name: 'Fanta Orange', brand: 'Coca-Cola', score: 58, nutrition: 12, taste: 80, consumer: 82, category: 'Beverages' },
      
      // Fairlife Products
      { name: 'Core Power Chocolate Protein Shake', brand: 'Fairlife', score: 85, nutrition: 85, taste: 88, consumer: 82, category: 'Dairy' },
      { name: 'Fairlife Whole Milk', brand: 'Fairlife', score: 81, nutrition: 78, taste: 85, consumer: 80, category: 'Dairy' },
      { name: 'Fairlife 2% Reduced Fat Milk', brand: 'Fairlife', score: 83, nutrition: 82, taste: 84, consumer: 83, category: 'Dairy' },
      { name: 'Core Power Vanilla Protein Shake', brand: 'Fairlife', score: 84, nutrition: 84, taste: 86, consumer: 82, category: 'Dairy' },
      
      // PepsiCo Products
      { name: 'Pepsi Cola', brand: 'PepsiCo', score: 61, nutrition: 12, taste: 83, consumer: 88, category: 'Beverages' },
      { name: 'Mountain Dew', brand: 'PepsiCo', score: 60, nutrition: 8, taste: 88, consumer: 85, category: 'Beverages' },
      { name: 'Lay\'s Classic Potato Chips', brand: 'Lay\'s', score: 67, nutrition: 25, taste: 85, consumer: 90, category: 'Snacks' },
      { name: 'Doritos Nacho Cheese', brand: 'Doritos', score: 70, nutrition: 22, taste: 92, consumer: 95, category: 'Snacks' },
      { name: 'Cheetos Crunchy', brand: 'Cheetos', score: 65, nutrition: 18, taste: 88, consumer: 89, category: 'Snacks' },
      { name: 'Fritos Original Corn Chips', brand: 'Fritos', score: 63, nutrition: 20, taste: 82, consumer: 87, category: 'Snacks' },
      
      // Sports & Energy Drinks
      { name: 'Gatorade Thirst Quencher Fruit Punch', brand: 'Gatorade', score: 69, nutrition: 45, taste: 78, consumer: 85, category: 'Sports Drinks' },
      { name: 'Powerade Mountain Berry Blast', brand: 'Powerade', score: 67, nutrition: 42, taste: 76, consumer: 83, category: 'Sports Drinks' },
      { name: 'Red Bull Energy Drink', brand: 'Red Bull', score: 66, nutrition: 35, taste: 75, consumer: 88, category: 'Energy Drinks' },
      { name: 'Monster Energy', brand: 'Monster', score: 58, nutrition: 25, taste: 78, consumer: 85, category: 'Energy Drinks' },
      { name: 'Rockstar Energy Drink', brand: 'Rockstar', score: 55, nutrition: 22, taste: 72, consumer: 80, category: 'Energy Drinks' },
      
      // Coffee & Beverages
      { name: 'Starbucks Frappuccino Vanilla', brand: 'Starbucks', score: 70, nutrition: 42, taste: 85, consumer: 82, category: 'Coffee Drinks' },
      { name: 'Starbucks Doubleshot Espresso', brand: 'Starbucks', score: 72, nutrition: 48, taste: 82, consumer: 85, category: 'Coffee Drinks' },
      { name: 'Dunkin\' Iced Coffee', brand: 'Dunkin\'', score: 68, nutrition: 38, taste: 80, consumer: 86, category: 'Coffee Drinks' },
      
      // Cereals
      { name: 'Frosted Flakes', brand: 'Kellogg\'s', score: 71, nutrition: 35, taste: 88, consumer: 90, category: 'Cereals' },
      { name: 'Cheerios Original', brand: 'General Mills', score: 78, nutrition: 75, taste: 70, consumer: 88, category: 'Cereals' },
      { name: 'Lucky Charms', brand: 'General Mills', score: 65, nutrition: 28, taste: 92, consumer: 85, category: 'Cereals' },
      { name: 'Froot Loops', brand: 'Kellogg\'s', score: 62, nutrition: 25, taste: 85, consumer: 88, category: 'Cereals' },
      { name: 'Honey Nut Cheerios', brand: 'General Mills', score: 74, nutrition: 65, taste: 78, consumer: 89, category: 'Cereals' },
      { name: 'Cinnamon Toast Crunch', brand: 'General Mills', score: 68, nutrition: 32, taste: 92, consumer: 90, category: 'Cereals' },
      
      // Cookies & Snacks
      { name: 'Oreo Original Sandwich Cookies', brand: 'Oreo', score: 72, nutrition: 25, taste: 95, consumer: 95, category: 'Cookies' },
      { name: 'Chips Ahoy! Original', brand: 'Chips Ahoy!', score: 68, nutrition: 22, taste: 88, consumer: 92, category: 'Cookies' },
      { name: 'Nutter Butter Peanut Butter Cookies', brand: 'Nutter Butter', score: 70, nutrition: 28, taste: 90, consumer: 88, category: 'Cookies' },
      { name: 'Ritz Crackers Original', brand: 'Ritz', score: 64, nutrition: 30, taste: 82, consumer: 85, category: 'Crackers' },
      { name: 'Goldfish Crackers Cheddar', brand: 'Pepperidge Farm', score: 66, nutrition: 32, taste: 85, consumer: 88, category: 'Crackers' },
      
      // Packaged Meals
      { name: 'Kraft Macaroni & Cheese Dinner', brand: 'Kraft', score: 69, nutrition: 35, taste: 85, consumer: 88, category: 'Packaged Meals' },
      { name: 'Campbell\'s Chicken Noodle Soup', brand: 'Campbell\'s', score: 68, nutrition: 45, taste: 75, consumer: 85, category: 'Soups' },
      { name: 'Chef Boyardee Beefaroni', brand: 'Chef Boyardee', score: 62, nutrition: 28, taste: 78, consumer: 80, category: 'Packaged Meals' },
      { name: 'Progresso Chicken & Rice Soup', brand: 'Progresso', score: 71, nutrition: 52, taste: 78, consumer: 83, category: 'Soups' },
      
      // Candy & Chocolate
      { name: 'Kit Kat Bar', brand: 'Nestlé', score: 58, nutrition: 18, taste: 85, consumer: 92, category: 'Candy' },
      { name: 'Snickers Bar', brand: 'Mars', score: 55, nutrition: 15, taste: 90, consumer: 88, category: 'Candy' },
      { name: 'M&M\'s Milk Chocolate', brand: 'Mars', score: 56, nutrition: 16, taste: 88, consumer: 90, category: 'Candy' },
      { name: 'Reese\'s Peanut Butter Cups', brand: 'Reese\'s', score: 59, nutrition: 20, taste: 92, consumer: 94, category: 'Candy' },
      { name: 'Twix Caramel Cookie Bars', brand: 'Mars', score: 57, nutrition: 17, taste: 89, consumer: 86, category: 'Candy' },
      { name: 'Hershey\'s Milk Chocolate Bar', brand: 'Hershey\'s', score: 54, nutrition: 14, taste: 85, consumer: 88, category: 'Candy' },
      
      // Breakfast Items
      { name: 'Pop-Tarts Strawberry', brand: 'Kellogg\'s', score: 48, nutrition: 20, taste: 82, consumer: 78, category: 'Breakfast' },
      { name: 'Eggo Homestyle Waffles', brand: 'Eggo', score: 65, nutrition: 38, taste: 80, consumer: 85, category: 'Breakfast' },
      { name: 'Nutella Hazelnut Spread', brand: 'Ferrero', score: 45, nutrition: 12, taste: 95, consumer: 88, category: 'Spreads' },
      { name: 'Quaker Instant Oatmeal Maple Brown Sugar', brand: 'Quaker', score: 73, nutrition: 68, taste: 75, consumer: 82, category: 'Breakfast' },
      
      // More Beverages
      { name: 'Arizona Iced Tea Green Tea', brand: 'Arizona', score: 42, nutrition: 15, taste: 75, consumer: 72, category: 'Beverages' },
      { name: 'Vitamin Water Power-C Dragonfruit', brand: 'Glacéau', score: 65, nutrition: 45, taste: 70, consumer: 80, category: 'Enhanced Water' },
      { name: 'Smartwater', brand: 'Glacéau', score: 88, nutrition: 95, taste: 78, consumer: 85, category: 'Water' },
      { name: 'Dasani Water', brand: 'Coca-Cola', score: 86, nutrition: 92, taste: 76, consumer: 82, category: 'Water' },
      { name: 'Aquafina Water', brand: 'PepsiCo', score: 85, nutrition: 90, taste: 75, consumer: 80, category: 'Water' },
      
      // Ice Cream & Frozen
      { name: 'Ben & Jerry\'s Chocolate Chip Cookie Dough', brand: 'Ben & Jerry\'s', score: 52, nutrition: 8, taste: 98, consumer: 92, category: 'Ice Cream' },
      { name: 'Häagen-Dazs Vanilla', brand: 'Häagen-Dazs', score: 48, nutrition: 12, taste: 95, consumer: 88, category: 'Ice Cream' },
      { name: 'Breyers Natural Vanilla', brand: 'Breyers', score: 55, nutrition: 18, taste: 85, consumer: 82, category: 'Ice Cream' },
      { name: 'Hot Pockets Pepperoni Pizza', brand: 'Hot Pockets', score: 58, nutrition: 25, taste: 78, consumer: 75, category: 'Frozen Meals' },
      
      // Healthy Options
      { name: 'Organic Granola Bar', brand: 'Nature Valley', score: 80, nutrition: 75, taste: 80, consumer: 85, category: 'Snack Bars' },
      { name: 'Greek Yogurt Plain', brand: 'Chobani', score: 85, nutrition: 95, taste: 70, consumer: 90, category: 'Dairy' },
      { name: 'Kind Dark Chocolate Nuts & Sea Salt Bar', brand: 'Kind', score: 82, nutrition: 78, taste: 85, consumer: 83, category: 'Snack Bars' },
      { name: 'Clif Bar Chocolate Chip', brand: 'Clif Bar', score: 79, nutrition: 72, taste: 82, consumer: 84, category: 'Energy Bars' },
      
      // Additional Popular Items
      { name: 'Pringles Original', brand: 'Pringles', score: 63, nutrition: 20, taste: 88, consumer: 82, category: 'Snacks' },
      { name: 'Triscuit Original Crackers', brand: 'Triscuit', score: 71, nutrition: 58, taste: 75, consumer: 80, category: 'Crackers' },
      { name: 'Wheat Thins Original', brand: 'Wheat Thins', score: 69, nutrition: 52, taste: 78, consumer: 82, category: 'Crackers' },
      { name: 'Planters Dry Roasted Peanuts', brand: 'Planters', score: 76, nutrition: 68, taste: 82, consumer: 78, category: 'Nuts' },
      { name: 'Sun-Maid Raisins', brand: 'Sun-Maid', score: 78, nutrition: 72, taste: 75, consumer: 85, category: 'Dried Fruit' }
    ];

    return popularBrandFoods.map((food, index) => ({
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
          vitamins: food.category === 'Cereals' ? ['Vitamin A', 'Vitamin C', 'Iron', 'Thiamin', 'Riboflavin'] : 
                   food.category === 'Dairy' ? ['Vitamin D', 'Calcium', 'Vitamin B12'] : 
                   ['Vitamin C', 'Iron']
        },
        health: {
          score: food.nutrition,
          warnings: food.nutrition < 50 ? [
            food.category === 'Beverages' ? 'High sugar content' : 'High sodium content',
            food.nutrition < 30 ? 'Low nutritional value' : 'Moderate nutritional concerns'
          ] : [],
          recommendations: [
            'Consider portion size',
            food.category === 'Snacks' ? 'Pair with fruits or vegetables' : 'Enjoy as part of balanced diet'
          ],
          allergens: food.category === 'Dairy' ? ['Contains milk'] : 
                    food.category === 'Cookies' || food.category === 'Cereals' ? ['May contain nuts', 'Contains gluten'] :
                    food.category === 'Snacks' && food.name.includes('Cheese') ? ['Contains milk'] : []
        },
        taste: {
          score: food.taste,
          profile: food.category === 'Beverages' ? ['Sweet', 'Refreshing', 'Carbonated'] :
                  food.category === 'Snacks' ? ['Salty', 'Crunchy', 'Savory'] :
                  food.category === 'Dairy' ? ['Creamy', 'Rich', 'Smooth'] :
                  food.category === 'Candy' ? ['Sweet', 'Indulgent', 'Rich'] :
                  ['Sweet', 'Satisfying', 'Flavorful'],
          description: `${food.brand} delivers a ${food.taste >= 85 ? 'exceptional' : food.taste >= 70 ? 'great' : 'good'} taste experience with ${food.category === 'Beverages' ? 'refreshing flavor' : food.category === 'Snacks' ? 'satisfying crunch and taste' : 'appealing texture and flavor'}.`
        },
        consumer: {
          score: food.consumer,
          feedback: `${food.brand} is a ${food.consumer >= 85 ? 'highly popular' : food.consumer >= 70 ? 'well-liked' : 'moderately popular'} brand with ${food.consumer >= 85 ? 'excellent' : 'good'} consumer satisfaction.`,
          satisfaction: food.consumer >= 85 ? 'High' : food.consumer >= 70 ? 'Medium' : 'Moderate',
          commonComplaints: food.consumer < 80 ? ['Price concerns', 'Availability issues'] : [],
          positiveAspects: [
            'Trusted brand',
            food.taste >= 80 ? 'Great taste' : 'Good flavor',
            'Wide availability',
            food.consumer >= 85 ? 'High consumer loyalty' : 'Brand recognition'
          ]
        },
        overall: {
          grade: food.score >= 80 ? 'A' : food.score >= 70 ? 'B' : food.score >= 60 ? 'C' : food.score >= 50 ? 'D' : 'F',
          summary: `${food.name} by ${food.brand} offers ${food.score >= 70 ? 'a good balance of' : food.score >= 50 ? 'moderate' : 'limited'} nutrition, taste, and consumer appeal. ${food.score >= 70 ? 'Recommended for occasional enjoyment.' : food.score >= 50 ? 'Consider moderation.' : 'Best enjoyed sparingly.'}`,
          vishScore: food.score
        }
      },
      userNotes: index % 4 === 0 ? `Tried this ${food.category.toLowerCase()} - ${food.score >= 70 ? 'really enjoyed it!' : food.score >= 50 ? 'it was okay' : 'not my favorite'}` : undefined
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

    // Top categories (simplified)
    const categories = analysisData.reduce((acc, analysis) => {
      const category = analysis.analysis.overall.vishScore >= 70 ? 'Healthy' : 
                     analysis.analysis.overall.vishScore >= 50 ? 'Moderate' : 'Unhealthy';
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
      ['Date', 'Food Name', 'Brand/Category', 'Vish Score', 'Nutrition Score', 'Taste Score', 'Consumer Score', 'Grade', 'Health Warnings', 'Recommendations', 'Notes'],
      ...analyses.map(analysis => [
        new Date(analysis.timestamp).toLocaleDateString(),
        analysis.foodName,
        // Extract brand from food name or use category
        analysis.foodName.includes('Coca-Cola') ? 'Coca-Cola' :
        analysis.foodName.includes('Fairlife') ? 'Fairlife' :
        analysis.foodName.includes('Pepsi') ? 'PepsiCo' :
        analysis.foodName.includes('Lay\'s') ? 'Lay\'s' :
        analysis.foodName.includes('Doritos') ? 'Doritos' :
        analysis.foodName.includes('Gatorade') ? 'Gatorade' :
        analysis.foodName.includes('Red Bull') ? 'Red Bull' :
        analysis.foodName.includes('Starbucks') ? 'Starbucks' :
        analysis.foodName.includes('Frosted Flakes') ? 'Kellogg\'s' :
        analysis.foodName.includes('Cheerios') ? 'General Mills' :
        analysis.foodName.includes('Oreo') ? 'Oreo' :
        analysis.foodName.includes('Kraft') ? 'Kraft' :
        analysis.foodName.includes('Campbell\'s') ? 'Campbell\'s' :
        analysis.foodName.includes('Nature Valley') ? 'Nature Valley' :
        analysis.foodName.includes('Chobani') ? 'Chobani' :
        'Various Brands',
        analysis.analysis.overall.vishScore,
        analysis.analysis.health.score,
        analysis.analysis.taste.score,
        analysis.analysis.consumer.score,
        analysis.analysis.overall.grade,
        analysis.analysis.health.warnings.join('; '),
        analysis.analysis.health.recommendations.join('; '),
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
                <p className="text-green-100">Track your food choices and health journey with popular brands</p>
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Including popular brands like Coca-Cola, Fairlife, Doritos & more!
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
                    {Math.round((stats.healthyChoices / stats.totalAnalyses) * 100)}% healthy (70+ Vish Score)
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Improvement Trend</span>
                    <span className={`text-lg font-bold ${stats.improvementTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    vs. previous period
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Score Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Nutrition</span>
                    </div>
                    <span className={`font-semibold ${getScoreColor(stats.averageNutritionScore)}`}>
                      {stats.averageNutritionScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Taste</span>
                    </div>
                    <span className={`font-semibold ${getScoreColor(stats.averageTasteScore)}`}>
                      {stats.averageTasteScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Consumer</span>
                    </div>
                    <span className={`font-semibold ${getScoreColor(stats.averageConsumerScore)}`}>
                      {stats.averageConsumerScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Monthly Activity</h4>
                <div className="space-y-2">
                  {stats.monthlyAnalyses.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(month.count / Math.max(...stats.monthlyAnalyses.map(m => m.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-6">{month.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={exportData}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export All Data</span>
              </button>
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Includes all {analyses.length} food analyses with brands, scores & details
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Filters and Search */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search food items, brands, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  >
                    <option value="all">All Foods</option>
                    <option value="healthy">Healthy (70+)</option>
                    <option value="unhealthy">Unhealthy {'(<50)'}</option>
                    <option value="recent">Recent (7 days)</option>
                  </select>

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
            </div>

            {/* Analysis List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {analyses.length === 0 ? 'No Analyses Yet' : 'No Results Found'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {analyses.length === 0 
                      ? 'Start analyzing food to see your history here!'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  {analyses.length === 0 && (
                    <button
                      onClick={onClose}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Start Analyzing Food
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {analysis.foodName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(analysis.timestamp).toLocaleDateString()}</span>
                            </div>
                            {analysis.userNotes && (
                              <div className="flex items-center space-x-1">
                                <span>📝</span>
                                <span className="truncate max-w-32">{analysis.userNotes}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(analysis.analysis.overall.vishScore)}`}>
                              {analysis.analysis.overall.vishScore}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Vish Score</div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(analysis.analysis.overall.grade)}`}>
                            Grade {analysis.analysis.overall.grade}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getScoreColor(analysis.analysis.health.score)}`}>
                            {analysis.analysis.health.score}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Nutrition</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getScoreColor(analysis.analysis.taste.score)}`}>
                            {analysis.analysis.taste.score}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Taste</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getScoreColor(analysis.analysis.consumer.score)}`}>
                            {analysis.analysis.consumer.score}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Consumer</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {analysis.analysis.health.warnings.length > 0 && (
                            <span className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{analysis.analysis.health.warnings.length} warning{analysis.analysis.health.warnings.length > 1 ? 's' : ''}</span>
                            </span>
                          )}
                          {analysis.analysis.health.warnings.length === 0 && (
                            <span className="flex items-center space-x-1 text-green-600 dark:text-green-400 text-xs">
                              <CheckCircle className="h-3 w-3" />
                              <span>No warnings</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAnalysis(analysis);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAnalysis(analysis.id);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            title="Delete Analysis"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedAnalysis.foodName}</h3>
                  <p className="text-green-100">
                    Analyzed on {new Date(selectedAnalysis.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedAnalysis(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Overall Score */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${getGradeColor(selectedAnalysis.analysis.overall.grade)} mb-4`}>
                  Overall Grade: {selectedAnalysis.analysis.overall.grade}
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-xl font-bold inline-block mb-4">
                  Vish Score: {selectedAnalysis.analysis.overall.vishScore}/100
                </div>
                <p className="text-gray-600 dark:text-gray-300">{selectedAnalysis.analysis.overall.summary}</p>
              </div>

              {/* Three Pillar Scores */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <Heart className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Nutrition</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis.health.score)}`}>
                    {selectedAnalysis.analysis.health.score}/100
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Health Impact</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <Star className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Taste</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis.taste.score)}`}>
                    {selectedAnalysis.analysis.taste.score}/100
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Flavor Quality</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Consumer</h4>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis.consumer.score)}`}>
                    {selectedAnalysis.analysis.consumer.score}/100
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">User Satisfaction</p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Nutrition Facts */}
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Nutrition Facts
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Calories:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAnalysis.analysis.nutrition.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Fat:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAnalysis.analysis.nutrition.totalFat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Sodium:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAnalysis.analysis.nutrition.sodium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Carbs:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAnalysis.analysis.nutrition.totalCarbohydrates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Protein:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAnalysis.analysis.nutrition.protein}</span>
                    </div>
                  </div>
                </div>

                {/* Consumer Insights */}
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Consumer Insights
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Satisfaction:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-2">{selectedAnalysis.analysis.consumer.satisfaction}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Feedback:</span>
                      <p className="text-gray-900 dark:text-white mt-1">{selectedAnalysis.analysis.consumer.feedback}</p>
                    </div>
                    {selectedAnalysis.analysis.consumer.positiveAspects.length > 0 && (
                      <div>
                        <span className="text-green-600 dark:text-green-400 font-medium">👍 Liked:</span>
                        <ul className="mt-1 space-y-1">
                          {selectedAnalysis.analysis.consumer.positiveAspects.slice(0, 2).map((aspect, index) => (
                            <li key={index} className="text-xs text-gray-700 dark:text-gray-300">• {aspect}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Warnings */}
              {selectedAnalysis.analysis.health.warnings.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                    Health Warnings
                  </h4>
                  <ul className="space-y-2">
                    {selectedAnalysis.analysis.health.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                        <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {selectedAnalysis.analysis.health.recommendations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {selectedAnalysis.analysis.health.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Taste Profile */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Taste Profile
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{selectedAnalysis.analysis.taste.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAnalysis.analysis.taste.profile.map((trait, index) => (
                    <span key={index} className="bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full text-xs">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* User Notes */}
              {selectedAnalysis.userNotes && (
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Notes</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedAnalysis.userNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};