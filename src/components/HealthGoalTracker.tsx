import React, { useState, useEffect } from 'react';
import { X, Target, TrendingUp, Calendar, Award, Plus, Edit3, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface HealthGoal {
  id: string;
  name: string;
  type: 'calories' | 'protein' | 'fiber' | 'sodium' | 'sugar' | 'vish_score';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  createdAt: string;
}

interface HealthGoalTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthGoalTracker: React.FC<HealthGoalTrackerProps> = ({ isOpen, onClose }) => {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    type: 'calories' as const,
    target: 0,
    unit: 'per day',
    deadline: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadGoals();
    }
  }, [isOpen]);

  const loadGoals = () => {
    const savedGoals = localStorage.getItem('foodcheck_health_goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  };

  const saveGoals = (updatedGoals: HealthGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('foodcheck_health_goals', JSON.stringify(updatedGoals));
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      alert('Please fill in all fields');
      return;
    }

    const goal: HealthGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      type: newGoal.type,
      target: newGoal.target,
      current: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      createdAt: new Date().toISOString()
    };

    saveGoals([...goals, goal]);
    setNewGoal({ name: '', type: 'calories', target: 0, unit: 'per day', deadline: '' });
    setShowAddGoal(false);
  };

  const updateGoal = (id: string, updates: Partial<HealthGoal>) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    );
    saveGoals(updatedGoals);
  };

  const deleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      saveGoals(goals.filter(goal => goal.id !== id));
    }
  };

  const updateProgress = (id: string, value: number) => {
    updateGoal(id, { current: Math.max(0, value) });
  };

  const getGoalProgress = (goal: HealthGoal) => {
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const getGoalStatus = (goal: HealthGoal) => {
    const progress = getGoalProgress(goal);
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const isOverdue = now > deadline;
    
    if (progress >= 100) return { status: 'completed', color: 'text-green-600', bg: 'bg-green-100' };
    if (isOverdue) return { status: 'overdue', color: 'text-red-600', bg: 'bg-red-100' };
    if (progress >= 75) return { status: 'on-track', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (progress >= 50) return { status: 'behind', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'started', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const getGoalTypeInfo = (type: string) => {
    const types = {
      calories: { label: 'Daily Calories', unit: 'cal', icon: '🔥' },
      protein: { label: 'Daily Protein', unit: 'g', icon: '💪' },
      fiber: { label: 'Daily Fiber', unit: 'g', icon: '🌾' },
      sodium: { label: 'Max Sodium', unit: 'mg', icon: '🧂' },
      sugar: { label: 'Max Sugar', unit: 'g', icon: '🍯' },
      vish_score: { label: 'Avg Vish Score', unit: 'points', icon: '⭐' }
    };
    return types[type as keyof typeof types] || { label: type, unit: '', icon: '📊' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Health Goal Tracker</h2>
                <p className="text-blue-100">Set and track your nutrition goals</p>
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

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Add Goal Button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Health Goals</h3>
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Goal</span>
            </button>
          </div>

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Health Goals Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Set your first health goal to start tracking your nutrition progress
              </p>
              <button
                onClick={() => setShowAddGoal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                const status = getGoalStatus(goal);
                const typeInfo = getGoalTypeInfo(goal.type);
                const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={goal.id} className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{typeInfo.icon}</div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {goal.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {typeInfo.label} • Target: {goal.target} {typeInfo.unit} {goal.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                          {status.status.replace('-', ' ')}
                        </span>
                        <button
                          onClick={() => setEditingGoal(goal)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {goal.current} / {goal.target} {typeInfo.unit} ({Math.round(progress)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            progress >= 100 ? 'bg-green-500' : 
                            progress >= 75 ? 'bg-blue-500' : 
                            progress >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    {/* Update Progress */}
                    <div className="flex items-center space-x-3 mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Update Progress:
                      </label>
                      <input
                        type="number"
                        value={goal.current}
                        onChange={(e) => updateProgress(goal.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                        min="0"
                        step="0.1"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{typeInfo.unit}</span>
                    </div>

                    {/* Deadline Info */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        daysLeft < 0 ? 'text-red-600' : daysLeft < 7 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {daysLeft < 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4" />
                            <span>{Math.abs(daysLeft)} days overdue</span>
                          </>
                        ) : progress >= 100 ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Completed!</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            <span>{daysLeft} days left</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Goal Modal */}
          {showAddGoal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Health Goal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Goal Name
                    </label>
                    <input
                      type="text"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      placeholder="e.g., Reduce daily calories"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Goal Type
                    </label>
                    <select
                      value={newGoal.type}
                      onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="calories">Daily Calories</option>
                      <option value="protein">Daily Protein</option>
                      <option value="fiber">Daily Fiber</option>
                      <option value="sodium">Max Daily Sodium</option>
                      <option value="sugar">Max Daily Sugar</option>
                      <option value="vish_score">Average Vish Score</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter target value"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddGoal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addGoal}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Add Goal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Goal Modal */}
          {editingGoal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Health Goal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Goal Name
                    </label>
                    <input
                      type="text"
                      value={editingGoal.name}
                      onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={editingGoal.target}
                      onChange={(e) => setEditingGoal({ ...editingGoal, target: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={editingGoal.deadline.split('T')[0]}
                      onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setEditingGoal(null)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateGoal(editingGoal.id, editingGoal);
                      setEditingGoal(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};