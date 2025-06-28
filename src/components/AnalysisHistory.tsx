import React, { useState, useEffect } from 'react';
import { X, Calendar, Search, Filter, Download, Trash2, Edit3, Star, BarChart3, Users, Award, TrendingUp, Heart, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { analysisService, AnalysisRecord, AnalysisStats } from '../services/analysisService';
import { VishScoreDisplay } from './VishScoreDisplay';
import { NutritionAnalysisPanel } from './NutritionAnalysisPanel';
import { TasteAnalysisPanel } from './TasteAnalysisPanel';
import { ConsumerRatingsPanel } from './ConsumerRatingsPanel';

interface AnalysisHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ isOpen, onClose }) => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'healthy' | 'moderate' | 'unhealthy'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'taste' | 'consumer'>('overview');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAnalyses();
    }
  }, [isOpen]);

  const loadAnalyses = () => {
    const allAnalyses = analysisService.getAnalysisHistory();
    const analysisStats = analysisService.calculateStats();
    setAnalyses(allAnalyses);
    setStats(analysisStats);
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (analysis.userNotes && analysis.userNotes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    
    const score = analysis.analysis.overall?.vishScore || 0;
    if (selectedCategory === 'healthy') return score >= 70;
    if (selectedCategory === 'moderate') return score >= 50 && score < 70;
    if (selectedCategory === 'unhealthy') return score < 50;
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.analysis.overall?.vishScore || 0) - (a.analysis.overall?.vishScore || 0);
      case 'name':
        return a.foodName.localeCompare(b.foodName);
      case 'date':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const handleDeleteAnalysis = (id: string) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      analysisService.deleteAnalysis(id);
      loadAnalyses();
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    }
  };

  const handleEditNotes = (analysis: AnalysisRecord) => {
    setEditingNotes(analysis.id);
    setNoteText(analysis.userNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    analysisService.updateAnalysisNotes(id, noteText);
    setEditingNotes(null);
    loadAnalyses();
    if (selectedAnalysis?.id === id) {
      setSelectedAnalysis({ ...selectedAnalysis, userNotes: noteText });
    }
  };

  const handleExportData = () => {
    const csvData = analysisService.exportToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
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
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getCategoryBadge = (score: number) => {
    if (score >= 70) return { label: 'Healthy', color: 'bg-green-500' };
    if (score >= 50) return { label: 'Moderate', color: 'bg-yellow-500' };
    return { label: 'Unhealthy', color: 'bg-red-500' };
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
                <h2 className="text-2xl font-bold text-white">Analysis History</h2>
                <p className="text-green-100">Your complete Vish Score analysis records</p>
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
          {/* Sidebar - Analysis List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Stats Overview */}
            {stats && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalAnalyses}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.averageVishScore}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Avg Vish</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.healthyChoices}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Healthy</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${stats.improvementTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stats.improvementTrend >= 0 ? '+' : ''}{stats.improvementTrend}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Trend</div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="healthy">Healthy (70+)</option>
                  <option value="moderate">Moderate (50-69)</option>
                  <option value="unhealthy">Unhealthy (&lt;50)</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>

              <button
                onClick={handleExportData}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Analysis List */}
            <div className="flex-1 overflow-y-auto">
              {filteredAnalyses.length === 0 ? (
                <div className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Analyses Found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filters.' 
                      : 'Start analyzing food to see your history here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredAnalyses.map((analysis) => {
                    const vishScore = analysis.analysis.overall?.vishScore || 0;
                    const nutritionScore = analysis.analysis.overall?.nutritionScore || analysis.analysis.health?.score || 0;
                    const tasteScore = analysis.analysis.overall?.tasteScore || analysis.analysis.taste?.score || 0;
                    const consumerScore = analysis.analysis.overall?.consumerScore || analysis.analysis.consumer?.score || 0;
                    const badge = getCategoryBadge(vishScore);
                    const isExpanded = expandedAnalysis === analysis.id;
                    
                    return (
                      <div
                        key={analysis.id}
                        className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          selectedAnalysis?.id === analysis.id 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' 
                            : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div onClick={() => setSelectedAnalysis(analysis)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {analysis.foodName}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(analysis.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className={`text-lg font-bold ${getScoreColor(vishScore)}`}>
                                {vishScore}
                              </span>
                            </div>
                          </div>

                          {/* Quick Score Overview */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center">
                              <div className={`text-sm font-bold ${getScoreColor(nutritionScore)}`}>
                                {nutritionScore}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Nutrition</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-sm font-bold ${getScoreColor(tasteScore)}`}>
                                {tasteScore}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Taste</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-sm font-bold ${getScoreColor(consumerScore)}`}>
                                {consumerScore}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Consumer</div>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedAnalysis(isExpanded ? null : analysis.id);
                            }}
                            className="w-full flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                          >
                            <span>Quick Details</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-2 space-y-2 text-xs">
                              {/* Mini Vish Score Display */}
                              <div className={`${getScoreBackground(vishScore)} rounded p-2`}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">Vish Score</span>
                                  <span className={`font-bold ${getScoreColor(vishScore)}`}>{vishScore}/100</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full"
                                    style={{ width: `${vishScore}%` }}
                                  />
                                </div>
                              </div>

                              {/* Key Nutrition Facts */}
                              {analysis.analysis.nutrition && (
                                <div className="bg-gray-50 dark:bg-gray-600 rounded p-2">
                                  <div className="font-medium mb-1">Nutrition Highlights</div>
                                  <div className="grid grid-cols-2 gap-1">
                                    <div>Calories: {analysis.analysis.nutrition.calories}</div>
                                    <div>Protein: {analysis.analysis.nutrition.protein}</div>
                                    <div>Sodium: {analysis.analysis.nutrition.sodium}</div>
                                    <div>Sugar: {analysis.analysis.nutrition.totalSugars}</div>
                                  </div>
                                </div>
                              )}

                              {/* Health Warnings */}
                              {analysis.analysis.health?.warnings?.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
                                  <div className="font-medium text-red-700 dark:text-red-300 mb-1">Health Warnings</div>
                                  <div className="text-red-600 dark:text-red-400">
                                    {analysis.analysis.health.warnings.slice(0, 2).map((warning, idx) => (
                                      <div key={idx}>• {warning}</div>
                                    ))}
                                    {analysis.analysis.health.warnings.length > 2 && (
                                      <div>+ {analysis.analysis.health.warnings.length - 2} more...</div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* User Notes */}
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">Notes</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditNotes(analysis);
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                </div>
                                {editingNotes === analysis.id ? (
                                  <div className="space-y-1">
                                    <textarea
                                      value={noteText}
                                      onChange={(e) => setNoteText(e.target.value)}
                                      className="w-full p-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600"
                                      rows={2}
                                      placeholder="Add your notes..."
                                    />
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveNotes(analysis.id);
                                        }}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingNotes(null);
                                        }}
                                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-700 dark:text-gray-300">
                                    {analysis.userNotes || 'No notes added'}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end space-x-1 pt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAnalysis(analysis);
                                  }}
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 flex items-center space-x-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View Full</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAnalysis(analysis.id);
                                  }}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 flex items-center space-x-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Detailed Analysis View */}
          <div className="flex-1 flex flex-col">
            {selectedAnalysis ? (
              <>
                {/* Analysis Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedAnalysis.foodName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Analyzed on {new Date(selectedAnalysis.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEditNotes(selectedAnalysis)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 text-sm"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Notes</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAnalysis(selectedAnalysis.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'overview'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>Vish Score Overview</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('nutrition')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'nutrition'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Nutrition Analysis</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('taste')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'taste'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>Taste Analysis</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('consumer')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'consumer'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Consumer Ratings</span>
                      </div>
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <VishScoreDisplay
                        nutritionScore={selectedAnalysis.analysis.overall?.nutritionScore || selectedAnalysis.analysis.health?.score || 0}
                        tasteScore={selectedAnalysis.analysis.overall?.tasteScore || selectedAnalysis.analysis.taste?.score || 0}
                        consumerScore={selectedAnalysis.analysis.overall?.consumerScore || selectedAnalysis.analysis.consumer?.score || 0}
                        vishScore={selectedAnalysis.analysis.overall?.vishScore || 0}
                        grade={selectedAnalysis.analysis.overall?.grade || 'N/A'}
                      />
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Overall Summary</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedAnalysis.analysis.overall?.summary || 'No summary available for this analysis.'}
                        </p>
                      </div>

                      {/* User Notes Section */}
                      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Your Notes</h4>
                          <button
                            onClick={() => handleEditNotes(selectedAnalysis)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center space-x-1"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        </div>
                        {editingNotes === selectedAnalysis.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-white"
                              rows={4}
                              placeholder="Add your personal notes about this food analysis..."
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveNotes(selectedAnalysis.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                              >
                                Save Notes
                              </button>
                              <button
                                onClick={() => setEditingNotes(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-700 dark:text-gray-300">
                            {selectedAnalysis.userNotes || (
                              <em className="text-gray-500 dark:text-gray-400">
                                No notes added yet. Click "Edit" to add your thoughts about this analysis.
                              </em>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'nutrition' && selectedAnalysis.analysis.nutrition && selectedAnalysis.analysis.health && (
                    <NutritionAnalysisPanel
                      nutrition={selectedAnalysis.analysis.nutrition}
                      health={selectedAnalysis.analysis.health}
                    />
                  )}

                  {activeTab === 'taste' && selectedAnalysis.analysis.taste && (
                    <TasteAnalysisPanel
                      taste={selectedAnalysis.analysis.taste}
                    />
                  )}

                  {activeTab === 'consumer' && selectedAnalysis.analysis.consumer && (
                    <ConsumerRatingsPanel
                      rating={selectedAnalysis.analysis.consumer}
                    />
                  )}
                </div>
              </>
            ) : (
              /* No Analysis Selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Select an Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose an analysis from the list to view detailed Vish Score breakdown
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};