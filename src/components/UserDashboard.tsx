import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Target, Award, Calendar, Download, Filter, Search, Heart, Eye, Trash2, Edit3 } from 'lucide-react';
import { analysisService, AnalysisStats } from '../services/analysisService';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'goals' | 'favorites'>('overview');

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen]);

  const loadDashboardData = () => {
    const analysisStats = analysisService.calculateStats();
    const recent = analysisService.getRecentAnalyses(5);
    const savedFavorites = JSON.parse(localStorage.getItem('foodcheck_favorites') || '[]');
    const savedGoals = JSON.parse(localStorage.getItem('foodcheck_goals') || '[]');
    
    setStats(analysisStats);
    setRecentAnalyses(recent);
    setFavorites(savedFavorites);
    setGoals(savedGoals);
  };

  const exportData = () => {
    const csvData = analysisService.exportToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodcheck-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('foodcheck_favorites', JSON.stringify(updatedFavorites));
  };

  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Dashboard</h2>
                <p className="text-purple-100">Track your nutrition journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportData}
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-6 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'history', label: 'History', icon: <Calendar className="h-4 w-4" /> },
              { id: 'goals', label: 'Goals', icon: <Target className="h-4 w-4" /> },
              { id: 'favorites', label: 'Favorites', icon: <Heart className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-purple-200 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-160px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-8 w-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{stats.averageVishScore}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Avg Vish Score</h3>
                  <p className="text-sm text-green-600">
                    {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend} trend
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{stats.totalAnalyses}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Total Analyses</h3>
                  <p className="text-sm text-blue-600">Foods analyzed</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="h-8 w-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">{stats.healthyChoices}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Healthy Choices</h3>
                  <p className="text-sm text-purple-600">70+ Vish Score</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">
                      {Math.round((stats.healthyChoices / stats.totalAnalyses) * 100) || 0}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Healthy Rate</h3>
                  <p className="text-sm text-orange-600">Improvement goal</p>
                </div>
              </div>

              {/* Recent Analyses */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Analyses</h3>
                {recentAnalyses.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No analyses yet. Start analyzing food to see your history here!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentAnalyses.map((analysis) => (
                      <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{analysis.foodName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(analysis.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {analysis.analysis.overall?.vishScore || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Vish Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly Progress Chart */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Progress</h3>
                <div className="space-y-3">
                  {stats.monthlyAnalyses.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{month.month}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (month.count / Math.max(...stats.monthlyAnalyses.map(m => m.count))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                          {month.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis History</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search analyses..."
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{analysis.foodName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Nutrition:</span>
                            <span className="ml-1 font-medium">{analysis.analysis.health?.score || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Taste:</span>
                            <span className="ml-1 font-medium">{analysis.analysis.taste?.score || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Consumer:</span>
                            <span className="ml-1 font-medium">{analysis.analysis.consumer?.score || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {analysis.analysis.overall?.vishScore || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Vish Score</div>
                        <div className="mt-2 flex space-x-1">
                          <button className="text-blue-500 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Goals</h3>
                <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                  Add Goal
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Goals Set
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Set health goals to track your nutrition progress
                  </p>
                  <button className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors">
                    Create Your First Goal
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {goals.map((goal, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{goal.description}</p>
                        </div>
                        <span className="text-sm text-purple-600 dark:text-purple-400">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Favorite Foods</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{favorites.length} items</span>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Favorites Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add foods to your favorites during analysis
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{favorite.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Added {new Date(favorite.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {favorite.vishScore}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Vish Score</div>
                          </div>
                          <button
                            onClick={() => removeFavorite(favorite.id)}
                            className="text-red-500 hover:text-red-700"
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
          )}
        </div>
      </div>
    </div>
  );
};