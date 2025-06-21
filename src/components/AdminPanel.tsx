import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, TrendingUp, Download, Heart, MessageCircle } from 'lucide-react';
import { emailService, UserRegistration } from '../services/emailService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<UserRegistration[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    emails: [] as string[]
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = () => {
    const allUsers = emailService.getAllUsers();
    const userStats = emailService.getUserStats();
    setUsers(allUsers);
    setStats(userStats);
  };

  const handleSelectUser = (email: string) => {
    setSelectedUsers(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.email));
    }
  };

  const exportUserData = () => {
    const csvContent = [
      ['Name', 'Email', 'Registration Date'],
      ...users.map(user => [
        user.name,
        user.email,
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodcheck-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
                <p className="text-green-100">User Management & Analytics</p>
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <Calendar className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.today}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.thisWeek}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
              <MessageCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.thisMonth}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
            </div>
          </div>

          {/* User Analytics */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">User Analytics</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Growth Chart Placeholder */}
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  User Growth
                </h4>
                <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    📈 {stats.total} total users registered
                  </p>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                  Engagement
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Active Users:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">New This Week:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.thisWeek}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Growth Rate:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">+{Math.round((stats.thisWeek / Math.max(stats.total - stats.thisWeek, 1)) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={exportUserData}
                disabled={users.length === 0}
                className="bg-gray-600 dark:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-400 transition-colors disabled:opacity-50 flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Export User Data
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Registered Users</h3>
                {users.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
            </div>

            {users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Users Yet</h4>
                <p className="text-gray-600 dark:text-gray-400">Users will appear here when they sign up for FoodCheck.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 dark:border-gray-500 text-green-600 focus:ring-green-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registration Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.email)}
                            onChange={() => handleSelectUser(user.email)}
                            className="rounded border-gray-300 dark:border-gray-500 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-300">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Additional Analytics */}
          {users.length > 0 && (
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {/* User Distribution */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  User Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Registered:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">This Month:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.thisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">This Week:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{stats.thisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Today:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.today}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-600 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      📧 Contact users directly at their registered email addresses
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use the export feature to get email lists for marketing campaigns
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      📊 Monitor user growth and engagement trends
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Track registration patterns to optimize user acquisition
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};