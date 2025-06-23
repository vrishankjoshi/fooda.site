// Service for managing food analysis history and statistics
export interface AnalysisRecord {
  id: string;
  timestamp: string;
  foodName: string;
  analysis: any; // NutritionAnalysis type
  imageUrl?: string;
  userNotes?: string;
}

export interface AnalysisStats {
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

class AnalysisService {
  private static instance: AnalysisService;
  private storageKey = 'foodcheck_analysis_history';

  static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  // Save analysis to history
  saveAnalysis(analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>): AnalysisRecord {
    const record: AnalysisRecord = {
      ...analysis,
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const history = this.getAnalysisHistory();
    const updatedHistory = [record, ...history];
    
    // Keep only the last 100 analyses to prevent storage bloat
    const trimmedHistory = updatedHistory.slice(0, 100);
    
    localStorage.setItem(this.storageKey, JSON.stringify(trimmedHistory));
    return record;
  }

  // Get all analysis history
  getAnalysisHistory(): AnalysisRecord[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading analysis history:', error);
      return [];
    }
  }

  // Get analysis by ID
  getAnalysisById(id: string): AnalysisRecord | null {
    const history = this.getAnalysisHistory();
    return history.find(record => record.id === id) || null;
  }

  // Delete analysis
  deleteAnalysis(id: string): boolean {
    const history = this.getAnalysisHistory();
    const updatedHistory = history.filter(record => record.id !== id);
    
    if (updatedHistory.length !== history.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
      return true;
    }
    return false;
  }

  // Update analysis notes
  updateAnalysisNotes(id: string, notes: string): boolean {
    const history = this.getAnalysisHistory();
    const recordIndex = history.findIndex(record => record.id === id);
    
    if (recordIndex !== -1) {
      history[recordIndex].userNotes = notes;
      localStorage.setItem(this.storageKey, JSON.stringify(history));
      return true;
    }
    return false;
  }

  // Calculate statistics
  calculateStats(): AnalysisStats {
    const history = this.getAnalysisHistory();
    
    if (history.length === 0) {
      return {
        totalAnalyses: 0,
        averageVishScore: 0,
        averageNutritionScore: 0,
        averageTasteScore: 0,
        averageConsumerScore: 0,
        healthyChoices: 0,
        improvementTrend: 0,
        topCategories: [],
        monthlyAnalyses: []
      };
    }

    const totalAnalyses = history.length;
    
    // Calculate averages
    const averageVishScore = Math.round(
      history.reduce((sum, record) => sum + (record.analysis.overall?.vishScore || 0), 0) / totalAnalyses
    );
    
    const averageNutritionScore = Math.round(
      history.reduce((sum, record) => sum + (record.analysis.health?.score || 0), 0) / totalAnalyses
    );
    
    const averageTasteScore = Math.round(
      history.reduce((sum, record) => sum + (record.analysis.taste?.score || 0), 0) / totalAnalyses
    );
    
    const averageConsumerScore = Math.round(
      history.reduce((sum, record) => sum + (record.analysis.consumer?.score || 0), 0) / totalAnalyses
    );

    // Count healthy choices (Vish Score >= 70)
    const healthyChoices = history.filter(record => 
      (record.analysis.overall?.vishScore || 0) >= 70
    ).length;

    // Calculate improvement trend
    const recentCount = Math.min(5, totalAnalyses);
    const recentAnalyses = history.slice(0, recentCount);
    const olderAnalyses = history.slice(-recentCount);
    
    const recentAvg = recentAnalyses.reduce((sum, record) => 
      sum + (record.analysis.overall?.vishScore || 0), 0
    ) / recentCount;
    
    const olderAvg = olderAnalyses.reduce((sum, record) => 
      sum + (record.analysis.overall?.vishScore || 0), 0
    ) / olderAnalyses.length;
    
    const improvementTrend = Math.round(recentAvg - olderAvg);

    // Calculate top categories
    const categories = history.reduce((acc, record) => {
      const score = record.analysis.overall?.vishScore || 0;
      const category = score >= 70 ? 'Healthy' : score >= 50 ? 'Moderate' : 'Unhealthy';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate monthly analyses (last 6 months)
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    history.forEach(record => {
      const date = new Date(record.timestamp);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey]++;
      }
    });

    const monthlyAnalyses = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }));

    return {
      totalAnalyses,
      averageVishScore,
      averageNutritionScore,
      averageTasteScore,
      averageConsumerScore,
      healthyChoices,
      improvementTrend,
      topCategories,
      monthlyAnalyses
    };
  }

  // Search analyses
  searchAnalyses(query: string): AnalysisRecord[] {
    const history = this.getAnalysisHistory();
    const lowercaseQuery = query.toLowerCase();
    
    return history.filter(record =>
      record.foodName.toLowerCase().includes(lowercaseQuery) ||
      (record.userNotes && record.userNotes.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Filter analyses by criteria
  filterAnalyses(criteria: {
    minScore?: number;
    maxScore?: number;
    dateFrom?: Date;
    dateTo?: Date;
    category?: 'healthy' | 'moderate' | 'unhealthy';
  }): AnalysisRecord[] {
    const history = this.getAnalysisHistory();
    
    return history.filter(record => {
      const score = record.analysis.overall?.vishScore || 0;
      const date = new Date(record.timestamp);
      
      // Score filters
      if (criteria.minScore !== undefined && score < criteria.minScore) return false;
      if (criteria.maxScore !== undefined && score > criteria.maxScore) return false;
      
      // Date filters
      if (criteria.dateFrom && date < criteria.dateFrom) return false;
      if (criteria.dateTo && date > criteria.dateTo) return false;
      
      // Category filter
      if (criteria.category) {
        const category = score >= 70 ? 'healthy' : score >= 50 ? 'moderate' : 'unhealthy';
        if (category !== criteria.category) return false;
      }
      
      return true;
    });
  }

  // Export data as CSV
  exportToCSV(): string {
    const history = this.getAnalysisHistory();
    
    const headers = [
      'Date',
      'Food Name',
      'Vish Score',
      'Nutrition Score',
      'Taste Score',
      'Consumer Score',
      'Grade',
      'Notes'
    ];

    const rows = history.map(record => [
      new Date(record.timestamp).toLocaleDateString(),
      record.foodName,
      record.analysis.overall?.vishScore || 0,
      record.analysis.health?.score || 0,
      record.analysis.taste?.score || 0,
      record.analysis.consumer?.score || 0,
      record.analysis.overall?.grade || 'N/A',
      record.userNotes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  // Clear all history
  clearHistory(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Get recent analyses (last N)
  getRecentAnalyses(count: number = 10): AnalysisRecord[] {
    const history = this.getAnalysisHistory();
    return history.slice(0, count);
  }

  // Get analyses by date range
  getAnalysesByDateRange(startDate: Date, endDate: Date): AnalysisRecord[] {
    const history = this.getAnalysisHistory();
    
    return history.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }
}

// Export singleton instance
export const analysisService = AnalysisService.getInstance();