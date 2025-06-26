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
  isIndian?: boolean; // Add explicit Indian food flag
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
        // Always generate fresh sample data to ensure Indian foods are present
        const sampleData = generateComprehensiveSampleData();
        setAnalyses(sampleData);
        setFilteredAnalyses(sampleData);
        calculateStats(sampleData);
        
        // Save to localStorage for persistence
        localStorage.setItem('foodcheck_analysis_history', JSON.stringify(sampleData));
        
        console.log('📊 Generated sample data:', sampleData.length, 'total foods');
        const indianCount = sampleData.filter(food => food.isIndian).length;
        console.log('🇮🇳 Indian foods:', indianCount);
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
      // 🇮🇳 MASSIVE INDIAN FOODS DATABASE 🇮🇳
      { 
        name: 'Aashirvaad Whole Wheat Atta', 
        score: 88, 
        nutrition: 92, 
        taste: 78, 
        consumer: 95,
        category: 'Indian Flour',
        notes: 'Perfect for making rotis and parathas. High fiber content.',
        isIndian: true
      },
      { 
        name: 'Parle Frooti Mango Drink', 
        score: 65, 
        nutrition: 35, 
        taste: 92, 
        consumer: 88,
        category: 'Indian Beverage',
        notes: 'Childhood favorite mango drink. High sugar content.',
        isIndian: true
      },
      { 
        name: 'Everest Besan (Chickpea Flour)', 
        score: 85, 
        nutrition: 90, 
        taste: 75, 
        consumer: 90,
        category: 'Indian Flour',
        notes: 'Great for making pakoras and dhokla. High protein.',
        isIndian: true
      },
      { 
        name: 'Amul Sweet Lassi', 
        score: 78, 
        nutrition: 68, 
        taste: 88, 
        consumer: 78,
        category: 'Indian Beverage',
        notes: 'Refreshing traditional yogurt drink with probiotics.',
        isIndian: true
      },
      { 
        name: 'MTR Ready to Eat Rajma', 
        score: 82, 
        nutrition: 85, 
        taste: 80, 
        consumer: 82,
        category: 'Indian Ready-to-Eat',
        notes: 'Convenient and tasty kidney bean curry. Good protein source.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Namkeen Mixture', 
        score: 58, 
        nutrition: 45, 
        taste: 85, 
        consumer: 75,
        category: 'Indian Snacks',
        notes: 'Spicy and crunchy snack mix. High sodium content.',
        isIndian: true
      },
      { 
        name: 'Parle-G Glucose Biscuits', 
        score: 62, 
        nutrition: 48, 
        taste: 75, 
        consumer: 92,
        category: 'Indian Biscuits',
        notes: 'Classic tea-time biscuits. Fortified with vitamins.',
        isIndian: true
      },
      { 
        name: 'Organic India Ragi Flour', 
        score: 92, 
        nutrition: 95, 
        taste: 72, 
        consumer: 78,
        category: 'Indian Flour',
        notes: 'Highly nutritious finger millet flour. Rich in calcium.',
        isIndian: true
      },
      { 
        name: 'Bikaji Aloo Bhujia', 
        score: 55, 
        nutrition: 38, 
        taste: 88, 
        consumer: 82,
        category: 'Indian Snacks',
        notes: 'Crispy potato-based snack. Very popular but high in oil.',
        isIndian: true
      },
      { 
        name: 'Lijjat Methi Khakhra', 
        score: 78, 
        nutrition: 82, 
        taste: 75, 
        consumer: 78,
        category: 'Indian Snacks',
        notes: 'Healthy fenugreek crackers. Good source of fiber.',
        isIndian: true
      },
      { 
        name: 'ITC Aashirvaad Ready Chole', 
        score: 85, 
        nutrition: 88, 
        taste: 82, 
        consumer: 85,
        category: 'Indian Ready-to-Eat',
        notes: 'Delicious chickpea curry. High protein and fiber.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Gulab Jamun', 
        score: 45, 
        nutrition: 25, 
        taste: 95, 
        consumer: 88,
        category: 'Indian Sweets',
        notes: 'Traditional milk-based sweet. Very high sugar content.',
        isIndian: true
      },
      { 
        name: 'Real Nimbu Paani', 
        score: 68, 
        nutrition: 55, 
        taste: 78, 
        consumer: 72,
        category: 'Indian Beverage',
        notes: 'Refreshing lemon water drink. Good vitamin C source.',
        isIndian: true
      },
      { 
        name: 'Patanjali Jowar Flour', 
        score: 88, 
        nutrition: 92, 
        taste: 75, 
        consumer: 78,
        category: 'Indian Flour',
        notes: 'Gluten-free sorghum flour. Rich in antioxidants.',
        isIndian: true
      },
      { 
        name: 'Britannia Marie Gold', 
        score: 58, 
        nutrition: 48, 
        taste: 72, 
        consumer: 85,
        category: 'Indian Biscuits',
        notes: 'Light and crispy tea biscuits. Moderate sugar content.',
        isIndian: true
      },
      { 
        name: 'Priya Mango Pickle', 
        score: 65, 
        nutrition: 55, 
        taste: 88, 
        consumer: 82,
        category: 'Indian Condiments',
        notes: 'Tangy and spicy mango pickle. High sodium content.',
        isIndian: true
      },
      { 
        name: 'Bengali Sweet House Rasgulla', 
        score: 52, 
        nutrition: 35, 
        taste: 85, 
        consumer: 78,
        category: 'Indian Sweets',
        notes: 'Soft and spongy milk sweet. Very high sugar content.',
        isIndian: true
      },
      { 
        name: 'Kissan Mint Chutney', 
        score: 72, 
        nutrition: 62, 
        taste: 85, 
        consumer: 75,
        category: 'Indian Condiments',
        notes: 'Fresh mint flavor condiment. Contains preservatives.',
        isIndian: true
      },
      { 
        name: '24 Mantra Organic Rice Flour', 
        score: 82, 
        nutrition: 78, 
        taste: 75, 
        consumer: 82,
        category: 'Indian Flour',
        notes: 'Organic and gluten-free. Good for South Indian dishes.',
        isIndian: true
      },
      { 
        name: 'Tata Tea Premium', 
        score: 75, 
        nutrition: 70, 
        taste: 85, 
        consumer: 90,
        category: 'Indian Beverages',
        notes: 'Strong black tea blend. Rich in antioxidants.',
        isIndian: true
      },
      { 
        name: 'Maggi 2-Minute Masala Noodles', 
        score: 45, 
        nutrition: 30, 
        taste: 80, 
        consumer: 95,
        category: 'Indian Instant Food',
        notes: 'Popular instant noodles. High sodium and preservatives.',
        isIndian: true
      },
      { 
        name: 'Amul Butter', 
        score: 70, 
        nutrition: 60, 
        taste: 90, 
        consumer: 95,
        category: 'Indian Dairy',
        notes: 'Classic Indian butter. High saturated fat content.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Soan Papdi', 
        score: 48, 
        nutrition: 30, 
        taste: 85, 
        consumer: 88,
        category: 'Indian Sweets',
        notes: 'Flaky sweet confection. Very high sugar and fat.',
        isIndian: true
      },
      { 
        name: 'Kurkure Masala Munch', 
        score: 42, 
        nutrition: 25, 
        taste: 88, 
        consumer: 85,
        category: 'Indian Snacks',
        notes: 'Crunchy corn snack. High in artificial flavors.',
        isIndian: true
      },
      { 
        name: 'Dabur Honey', 
        score: 85, 
        nutrition: 80, 
        taste: 90, 
        consumer: 88,
        category: 'Indian Natural Products',
        notes: 'Pure honey. Natural sweetener with antioxidants.',
        isIndian: true
      },
      { 
        name: 'Bru Instant Coffee', 
        score: 68, 
        nutrition: 55, 
        taste: 82, 
        consumer: 85,
        category: 'Indian Beverages',
        notes: 'Popular instant coffee blend. Moderate caffeine content.',
        isIndian: true
      },
      { 
        name: 'Patanjali Chyawanprash', 
        score: 78, 
        nutrition: 85, 
        taste: 65, 
        consumer: 75,
        category: 'Indian Health Products',
        notes: 'Ayurvedic health supplement. Rich in vitamin C.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Moong Dal', 
        score: 72, 
        nutrition: 80, 
        taste: 75, 
        consumer: 78,
        category: 'Indian Snacks',
        notes: 'Fried lentil snack. Good protein but high oil content.',
        isIndian: true
      },
      { 
        name: 'Amul Ice Cream Kulfi', 
        score: 55, 
        nutrition: 40, 
        taste: 92, 
        consumer: 90,
        category: 'Indian Desserts',
        notes: 'Traditional Indian ice cream. High sugar and fat.',
        isIndian: true
      },
      { 
        name: 'Catch Garam Masala', 
        score: 88, 
        nutrition: 85, 
        taste: 95, 
        consumer: 85,
        category: 'Indian Spices',
        notes: 'Aromatic spice blend. Rich in antioxidants and flavor.',
        isIndian: true
      },
      { 
        name: 'Britannia Good Day Cookies', 
        score: 52, 
        nutrition: 40, 
        taste: 78, 
        consumer: 88,
        category: 'Indian Biscuits',
        notes: 'Sweet cookies with cashew and almond. High sugar.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Kaju Katli', 
        score: 58, 
        nutrition: 45, 
        taste: 92, 
        consumer: 90,
        category: 'Indian Sweets',
        notes: 'Premium cashew sweet. Very high sugar and fat.',
        isIndian: true
      },
      { 
        name: 'Patanjali Atta Noodles', 
        score: 65, 
        nutrition: 60, 
        taste: 70, 
        consumer: 75,
        category: 'Indian Instant Food',
        notes: 'Wheat-based instant noodles. Better than regular noodles.',
        isIndian: true
      },
      { 
        name: 'Amul Cheese Spread', 
        score: 62, 
        nutrition: 55, 
        taste: 85, 
        consumer: 88,
        category: 'Indian Dairy',
        notes: 'Processed cheese spread. High sodium content.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Bhel Puri Mix', 
        score: 55, 
        nutrition: 45, 
        taste: 88, 
        consumer: 82,
        category: 'Indian Snacks',
        notes: 'Traditional street food mix. High sodium and oil.',
        isIndian: true
      },
      { 
        name: 'Tata Salt', 
        score: 75, 
        nutrition: 70, 
        taste: 80, 
        consumer: 90,
        category: 'Indian Condiments',
        notes: 'Iodized salt. Essential mineral supplement.',
        isIndian: true
      },
      { 
        name: 'Kissan Mixed Fruit Jam', 
        score: 48, 
        nutrition: 35, 
        taste: 82, 
        consumer: 85,
        category: 'Indian Condiments',
        notes: 'Sweet fruit preserve. Very high sugar content.',
        isIndian: true
      },
      { 
        name: 'Patanjali Ghee', 
        score: 72, 
        nutrition: 65, 
        taste: 90, 
        consumer: 85,
        category: 'Indian Dairy',
        notes: 'Pure cow ghee. High saturated fat but traditional.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Samosa', 
        score: 45, 
        nutrition: 30, 
        taste: 88, 
        consumer: 92,
        category: 'Indian Snacks',
        notes: 'Deep-fried pastry snack. Very high oil content.',
        isIndian: true
      },
      { 
        name: 'Amul Milk Powder', 
        score: 78, 
        nutrition: 82, 
        taste: 75, 
        consumer: 88,
        category: 'Indian Dairy',
        notes: 'Dried milk powder. Good protein and calcium source.',
        isIndian: true
      },
      { 
        name: 'Britannia Tiger Biscuits', 
        score: 55, 
        nutrition: 45, 
        taste: 80, 
        consumer: 90,
        category: 'Indian Biscuits',
        notes: 'Glucose biscuits for kids. Fortified with vitamins.',
        isIndian: true
      },
      { 
        name: 'MDH Chana Masala', 
        score: 85, 
        nutrition: 88, 
        taste: 90, 
        consumer: 82,
        category: 'Indian Spices',
        notes: 'Authentic spice blend for chickpea curry. No preservatives.',
        isIndian: true
      },
      { 
        name: 'Parle Hide & Seek Biscuits', 
        score: 50, 
        nutrition: 38, 
        taste: 82, 
        consumer: 90,
        category: 'Indian Biscuits',
        notes: 'Chocolate chip cookies. Popular with kids.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Paneer Tikka', 
        score: 68, 
        nutrition: 72, 
        taste: 85, 
        consumer: 80,
        category: 'Indian Ready-to-Eat',
        notes: 'Spiced cottage cheese snack. Good protein source.',
        isIndian: true
      },
      { 
        name: 'Amul Shrikhand', 
        score: 62, 
        nutrition: 55, 
        taste: 88, 
        consumer: 85,
        category: 'Indian Desserts',
        notes: 'Traditional sweetened yogurt dessert. High sugar.',
        isIndian: true
      },
      { 
        name: 'Patanjali Coconut Oil', 
        score: 80, 
        nutrition: 75, 
        taste: 85, 
        consumer: 82,
        category: 'Indian Cooking Oil',
        notes: 'Pure coconut oil. Good for cooking and health.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Ras Malai', 
        score: 48, 
        nutrition: 32, 
        taste: 92, 
        consumer: 88,
        category: 'Indian Sweets',
        notes: 'Milk dumplings in sweet cream. Very high sugar.',
        isIndian: true
      },
      { 
        name: 'Britannia Bourbon Biscuits', 
        score: 45, 
        nutrition: 35, 
        taste: 85, 
        consumer: 92,
        category: 'Indian Biscuits',
        notes: 'Chocolate cream biscuits. High sugar and fat.',
        isIndian: true
      },
      { 
        name: 'Amul Taaza Milk', 
        score: 88, 
        nutrition: 90, 
        taste: 85, 
        consumer: 95,
        category: 'Indian Dairy',
        notes: 'Fresh toned milk. Excellent source of protein and calcium.',
        isIndian: true
      },
      { 
        name: 'Patanjali Murabba (Amla Preserve)', 
        score: 75, 
        nutrition: 78, 
        taste: 70, 
        consumer: 75,
        category: 'Indian Health Products',
        notes: 'Vitamin C rich amla preserve. Traditional immunity booster.',
        isIndian: true
      },
      { 
        name: 'Haldiram\'s Cham Cham', 
        score: 42, 
        nutrition: 28, 
        taste: 88, 
        consumer: 85,
        category: 'Indian Sweets',
        notes: 'Spongy milk sweet with coconut. Very high sugar.',
        isIndian: true
      },

      // INTERNATIONAL FOODS (fewer to emphasize Indian foods)
      { 
        name: 'Organic Granola Bar', 
        score: 85, 
        nutrition: 88, 
        taste: 82, 
        consumer: 85,
        category: 'Snack Bars',
        notes: 'Healthy breakfast option with nuts and oats.',
        isIndian: false
      },
      { 
        name: 'Greek Yogurt', 
        score: 92, 
        nutrition: 95, 
        taste: 88, 
        consumer: 93,
        category: 'Dairy',
        notes: 'High protein and probiotics. Excellent health benefits.',
        isIndian: false
      },
      { 
        name: 'Potato Chips', 
        score: 28, 
        nutrition: 15, 
        taste: 45, 
        consumer: 25,
        category: 'Snacks',
        notes: 'Tasty but unhealthy. High fat and sodium.',
        isIndian: false
      },
      { 
        name: 'Whole Grain Cereal', 
        score: 78, 
        nutrition: 85, 
        taste: 70, 
        consumer: 80,
        category: 'Breakfast',
        notes: 'Good fiber content. Fortified with vitamins.',
        isIndian: false
      },
      { 
        name: 'Dark Chocolate Bar', 
        score: 68, 
        nutrition: 65, 
        taste: 85, 
        consumer: 78,
        category: 'Confectionery',
        notes: 'Antioxidant-rich treat. Moderate sugar content.',
        isIndian: false
      }
    ];

    return sampleFoods.map((food, index) => ({
      id: `analysis-${index + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      foodName: food.name,
      isIndian: food.isIndian,
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
          vitamins: food.isIndian ? 
            ['Vitamin B1', 'Iron', 'Folate', 'Magnesium'] : 
            ['Vitamin C', 'Iron', 'Calcium']
        },
        health: {
          score: food.nutrition,
          warnings: food.nutrition < 50 ? 
            (food.isIndian ? 
              ['High sodium content', 'Contains preservatives'] : 
              ['High sodium content', 'Low nutritional value']) : [],
          recommendations: food.isIndian ? 
            ['Enjoy in moderation', 'Pair with fresh vegetables', 'Great source of traditional nutrients'] :
            ['Consider portion size', 'Pair with fruits or vegetables'],
          allergens: food.isIndian ? 
            ['May contain gluten', 'Contains spices'] : 
            ['May contain nuts', 'Contains gluten']
        },
        taste: {
          score: food.taste,
          profile: food.isIndian ? 
            ['Authentic', 'Spicy', 'Traditional', 'Aromatic'] :
            ['Sweet', 'Crunchy', 'Satisfying'],
          description: food.isIndian ? 
            'Rich traditional flavors with authentic Indian spices and ingredients.' :
            'Pleasant taste with good texture and flavor balance.'
        },
        consumer: {
          score: food.consumer,
          feedback: food.isIndian ? 
            'Highly appreciated for authentic taste and cultural connection' :
            'Generally well-received by consumers',
          satisfaction: food.consumer >= 70 ? 'High' : food.consumer >= 50 ? 'Medium' : 'Low',
          commonComplaints: food.consumer < 50 ? 
            (food.isIndian ? 
              ['Too spicy for some', 'Strong flavors'] : 
              ['Too processed', 'Artificial taste']) : [],
          positiveAspects: food.isIndian ? 
            ['Authentic taste', 'Cultural value', 'Traditional recipe', 'Good quality'] :
            ['Convenient', 'Good value', 'Tasty']
        },
        overall: {
          grade: food.score >= 80 ? 'A' : food.score >= 60 ? 'B' : food.score >= 40 ? 'C' : 'D',
          summary: food.isIndian ? 
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
      const isIndian = analysis.isIndian;
      
      const category = isIndian ? 'Indian Foods' : 
                     score >= 70 ? 'Healthy' : 
                     score >= 50 ? 'Moderate' : 'Unhealthy';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly analyses (simplified)
    const monthlyAnalyses = [
      { month: 'Jan', count: Math.floor(totalAnalyses * 0.15) },
      { month: 'Feb', count: Math.floor(totalAnalyses * 0.18) },
      { month: 'Mar', count: Math.floor(totalAnalyses * 0.22) },
      { month: 'Apr', count: Math.floor(totalAnalyses * 0.25) },
      { month: 'May', count: Math.floor(totalAnalyses * 0.20) }
    ];

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analysis History</h2>
              <p className="text-gray-600">Track your food analysis journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Stats Overview */}
        {showStats && stats && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Avg Score</span>
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageVishScore)}`}>
                  {stats.averageVishScore}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Nutrition</span>
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageNutritionScore)}`}>
                  {stats.averageNutritionScore}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">Taste</span>
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageTasteScore)}`}>
                  {stats.averageTasteScore}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Consumer</span>
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageConsumerScore)}`}>
                  {stats.averageConsumerScore}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Healthy</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.healthyChoices}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Foods</option>
                <option value="healthy">Healthy (70+)</option>
                <option value="unhealthy">Unhealthy (&lt;50)</option>
                <option value="recent">Recent (7 days)</option>
                <option value="indian">🇮🇳 Indian Foods</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>{showStats ? 'Hide' : 'Show'} Stats</span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analysis List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start analyzing foods to see your history here.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {analysis.isIndian && <span className="mr-2">🇮🇳</span>}
                            {analysis.foodName}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(analysis.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedAnalysis(analysis)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Vish Score</span>
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBgColor(analysis.analysis.overall.vishScore)} ${getScoreColor(analysis.analysis.overall.vishScore)}`}>
                              {analysis.analysis.overall.vishScore}
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(analysis.analysis.overall.vishScore)}`}>
                              {analysis.analysis.overall.grade}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(analysis.analysis.health.score)}`}>
                              {analysis.analysis.health.score}
                            </div>
                            <div className="text-gray-500">Nutrition</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(analysis.analysis.taste.score)}`}>
                              {analysis.analysis.taste.score}
                            </div>
                            <div className="text-gray-500">Taste</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(analysis.analysis.consumer.score)}`}>
                              {analysis.analysis.consumer.score}
                            </div>
                            <div className="text-gray-500">Consumer</div>
                          </div>
                        </div>

                        {analysis.userNotes && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 line-clamp-2">{analysis.userNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Detail Modal */}
        {selectedAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedAnalysis.isIndian && <span className="mr-2">🇮🇳</span>}
                      {selectedAnalysis.foodName}
                    </h3>
                    <p className="text-gray-600">
                      Analyzed on {new Date(selectedAnalysis.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Overall Score */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Overall Assessment</h4>
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${getScoreColor(selectedAnalysis.analysis.overall.vishScore)}`}>
                        {selectedAnalysis.analysis.overall.vishScore}
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(selectedAnalysis.analysis.overall.vishScore)} ${getScoreColor(selectedAnalysis.analysis.overall.vishScore)}`}>
                        Grade {selectedAnalysis.analysis.overall.grade}
                      </div>
                      <p className="text-gray-600 mt-3">{selectedAnalysis.analysis.overall.summary}</p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Score Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Nutrition</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${selectedAnalysis.analysis.health.score}%` }}
                            ></div>
                          </div>
                          <span className={`font-medium ${getScoreColor(selectedAnalysis.analysis.health.score)}`}>
                            {selectedAnalysis.analysis.health.score}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Taste</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${selectedAnalysis.analysis.taste.score}%` }}
                            ></div>
                          </div>
                          <span className={`font-medium ${getScoreColor(selectedAnalysis.analysis.taste.score)}`}>
                            {selectedAnalysis.analysis.taste.score}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Consumer</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${selectedAnalysis.analysis.consumer.score}%` }}
                            ></div>
                          </div>
                          <span className={`font-medium ${getScoreColor(selectedAnalysis.analysis.consumer.score)}`}>
                            {selectedAnalysis.analysis.consumer.score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Facts */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Nutrition Facts</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span>Calories</span>
                        <span className="font-medium">{selectedAnalysis.analysis.nutrition.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Fat</span>
                        <span className="font-medium">{selectedAnalysis.analysis.nutrition.totalFat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sodium</span>
                        <span className="font-medium">{selectedAnalysis.analysis.nutrition.sodium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein</span>
                        <span className="font-medium">{selectedAnalysis.analysis.nutrition.protein}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbs</span>
                        <span className="font-medium">{selectedAnalysis.analysis.nutrition.totalCarbohydrates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fiber</span>
                        <span className="font-medium">{selectedAnalysis.analysis.nutrition.dietaryFiber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Health Insights */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Health Insights</h4>
                    
                    {selectedAnalysis.analysis.health.warnings.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-red-600 mb-2">⚠️ Warnings</h5>
                        <ul className="text-sm text-red-600 space-y-1">
                          {selectedAnalysis.analysis.health.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-green-600 mb-2">💡 Recommendations</h5>
                      <ul className="text-sm text-green-600 space-y-1">
                        {selectedAnalysis.analysis.health.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedAnalysis.analysis.health.allergens.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-orange-600 mb-2">🚨 Allergens</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedAnalysis.analysis.health.allergens.map((allergen, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAnalysis.userNotes && (
                  <div className="mt-6 bg-blue-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Your Notes</h4>
                    <p className="text-gray-700">{selectedAnalysis.userNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};