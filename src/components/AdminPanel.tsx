import React, { useState, useEffect } from 'react';
import { X, Mail, Users, Calendar, TrendingUp, Send, CheckCircle, AlertTriangle, Download, Heart, MessageCircle } from 'lucide-react';
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
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [isSendingHi, setIsSendingHi] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [hiStatus, setHiStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
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

  const handleSendWelcomeEmails = async () => {
    setIsSendingEmails(true);
    setEmailStatus('sending');
    
    try {
      await emailService.sendWelcomeEmailToAll();
      setEmailStatus('success');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (error) {
      console.error('Error sending emails:', error);
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } finally {
      setIsSendingEmails(false);
    }
  };

  const handleSendHiToAll = async () => {
    setIsSendingHi(true);
    setHiStatus('sending');
    
    try {
      await emailService.sendHiToAllUsers();
      setHiStatus('success');
      setTimeout(() => setHiStatus('idle'), 3000);
    } catch (error) {
      console.error('Error sending Hi messages:', error);
      setHiStatus('error');
      setTimeout(() => setHiStatus('idle'), 3000);
    } finally {
      setIsSendingHi(false);
    }
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
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
                <p className="text-green-100">User Management & Email System</p>
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
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.today}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.thisWeek}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <Mail className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{stats.thisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
          </div>

          {/* Email Actions */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Email Actions</h3>
            
            {emailStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-700">Welcome emails sent successfully to all users!</p>
                </div>
              </div>
            )}

            {hiStatus === 'success' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-blue-700">Personal Hi messages sent successfully to all users! 👋</p>
                </div>
              </div>
            )}

            {(emailStatus === 'error' || hiStatus === 'error') && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-700">Error sending messages. Please try again.</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Welcome Emails */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-green-600" />
                  Welcome Emails
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Send comprehensive welcome emails with getting started guide and feature overview.
                </p>
                <button
                  onClick={handleSendWelcomeEmails}
                  disabled={isSendingEmails || users.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                >
                  {isSendingEmails ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Welcome Emails ({stats.total})
                    </>
                  )}
                </button>
              </div>

              {/* Personal Hi Messages */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Hi Messages
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Send personalized "Hi" messages to show you care about each user individually.
                </p>
                <button
                  onClick={handleSendHiToAll}
                  disabled={isSendingHi || users.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                >
                  {isSendingHi ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saying Hi...
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5 mr-2" />
                      Say Hi to Everyone ({stats.total}) 👋
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Export Button */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={exportUserData}
                disabled={users.length === 0}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Export User Data
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Registered Users</h3>
                {users.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
            </div>

            {users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Users Yet</h4>
                <p className="text-gray-600">Users will appear here when they sign up for FoodCheck.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.email)}
                            onChange={() => handleSelectUser(user.email)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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

          {/* Email Previews */}
          {users.length > 0 && (
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {/* Welcome Email Preview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-green-600" />
                  Welcome Email Preview
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Subject: Welcome to FoodCheck! 🍎</div>
                  <div className="text-sm text-gray-800">
                    Hi [User Name]! Welcome to FoodCheck! We're excited to help you make better food choices through our comprehensive analysis tools...
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Full email includes: Welcome message, getting started guide, feature overview, and contact information.
                  </div>
                </div>
              </div>

              {/* Hi Message Preview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Hi Message Preview
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Subject: Hi from FoodCheck! 👋</div>
                  <div className="text-sm text-gray-800">
                    Hi [User Name]! Just wanted to say Hi and let you know we're thinking of you! We hope you're enjoying your FoodCheck experience...
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Personal greeting with encouragement, appreciation, and reminder of available features.
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