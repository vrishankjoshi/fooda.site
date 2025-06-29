import React, { useState, useEffect } from 'react';
import { X, TrendingUp, BarChart3, PieChart, Calendar, Download, Filter, Target, Award, Zap } from 'lucide-react';
import { analysisService } from '../services/analysisService';

interface AdvancedAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  weeklyTrends: { week: string; avgScore: number; analyses: number }[];
  categoryBreakdown: { category: string; count: number; avgScore: number }[];
  healthProgress: { date: string; score: number }[];
  nutritionTrends: { nutrient: string; trend: number; current: number }[];
  achievements: { name: string; date: string; score: number }[];
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ isOpen, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeMetric, setActiveMetric] = useState<'vish' | 'nutrition' | 'taste' | 'consumer'>('vish');

  useEffect(() => {
    if (isOpen) {
      loadAnalyticsData();
    }
  }, [isOpen, timeRange]);

  const loadAnalyticsData = () => {
    // Generate mock analytics data
    const mockData: AnalyticsData = {
      weeklyTrends: [
        { week: 'Week 1', avgScore: 68, analyses: 12 },
        { week: 'Week 2', avgScore: 72, analyses: 15 },
        { week: 'Week 3', avgScore: 75, analyses: 18 },
        { week: 'Week 4', avgScore: 78, analyses: 21 }
      ],
      categoryBreakdown: [
        { category: 'Healthy', count: 45, avgScore: 82 },
        { category: 'Moderate', count: 28, avgScore: 65 },
        { category: 'Unhealthy', count: 12, avgScore: 38 }
      ],
      healthProgress: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: Math.floor(Math.random() * 40) + 60
      })),
      nutritionTrends: [
        { nutrient: 'Protein', trend: 12, current: 85 },
        { nutrient: 'Fiber', trend: 8, current: 78 },
        { nutrient: 'Sodium', trend: -15, current: 65 },
        { nutrient: 'Sugar', trend: -22, current: 72 }
      ],
      achievements: [
        { name: 'Vish Score Master', date: '2024-01-15', score: 85 },
        { name: 'Health Warrior', date: '2024-01-10', score: 78 },
        { name: 'Consistency King', date: '2024-01-05', score: 82 }
      ]
    };

    setAnalyticsData(mockData);
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;

    const csvData = [
      ['Metric', 'Value', 'Trend'],
      ...analyticsData.nutritionTrends.map(trend => [
        trend.nutrient,
        trend.current.toString(),
        trend.trend > 0 ? `+${trend.trend}%` : `${trend.trend}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodcheck-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !analyticsData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
                <p className="text-indigo-100">Deep insights into your food choices</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportAnalytics}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-3 py-2"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>

            <div className="flex space-x-2">
              {['vish', 'nutrition', 'taste', 'consumer'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setActiveMetric(metric as any)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeMetric === metric
                      ? 'bg-white text-indigo-600'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-160px)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-green-600">78</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Avg Vish Score</h3>
              <p className="text-sm text-green-600">+5% from last month</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">156</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Total Analyses</h3>
              <p className="text-sm text-blue-600">+12 this week</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">67%</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Healthy Choices</h3>
              <p className="text-sm text-purple-600">+8% improvement</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">7</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Day Streak</h3>
              <p className="text-sm text-orange-600">Personal best!</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weekly Trends */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Progress</h3>
              <div className="space-y-4">
                {analyticsData.weeklyTrends.map((week, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{week.week}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${week.avgScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                        {week.avgScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Food Categories</h3>
              <div className="space-y-4">
                {analyticsData.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        category.category === 'Healthy' ? 'bg-green-500' :
                        category.category === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-900 dark:text-white">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.count} foods
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Avg: {category.avgScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nutrition Trends */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nutrition Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.nutritionTrends.map((trend, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {trend.current}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {trend.nutrient}
                  </div>
                  <div className={`text-xs font-medium ${
                    trend.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.trend > 0 ? '+' : ''}{trend.trend}% this month
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Recent Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyticsData.achievements.map((achievement, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(achievement.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium text-yellow-600 mt-1">
                    Score: {achievement.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};