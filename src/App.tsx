import React, { useState, useEffect } from 'react';
import { Camera, Upload, MessageCircle, Star, BarChart3, Heart, Mail, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { VisionAnalysis } from './components/VisionAnalysis';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { FoodCheckLogo } from './components/FoodCheckLogo';
import { useAuth } from './hooks/useAuth';
import { sendMessageToGroq, ChatMessage } from './services/groqService';
import { NutritionAnalysis } from './services/visionService';
import { emailService } from './services/emailService';

function App() {
  const [showVisionAnalysis, setShowVisionAnalysis] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const { user, isAuthenticated, login, logout } = useAuth();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('foodcheck_dark_mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('foodcheck_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAuthSuccess = async (userData: { email: string; name: string }) => {
    login(userData);
    
    // Register user in email service for admin panel
    try {
      await emailService.registerUser(userData.name, userData.email);
    } catch (error) {
      // User might already be registered, that's okay
      console.log('User registration note:', error);
    }
  };

  const handleCameraAnalysis = (analysis: NutritionAnalysis) => {
    // Add analysis result to chat
    const analysisMessage = `🎉 **Analysis Complete!**

**Overall Grade: ${analysis.overall.grade}**
${analysis.overall.summary}

**Nutrition Score: ${analysis.health.score}/100**
**Taste Score: ${analysis.taste.score}/100**

${analysis.health.warnings.length > 0 ? `⚠️ **Health Warnings:**\n${analysis.health.warnings.map(w => `• ${w}`).join('\n')}\n\n` : ''}

${analysis.health.recommendations.length > 0 ? `💡 **Recommendations:**\n${analysis.health.recommendations.map(r => `• ${r}`).join('\n')}\n\n` : ''}

**Taste Profile:** ${analysis.taste.description}

Want to analyze another food or have questions about these results?`;

    setChatMessages(prev => [...prev, { type: 'bot', message: analysisMessage }]);
    setShowChatbot(true);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    
    // Add user message to chat
    const newMessages = [...chatMessages, { type: 'user' as const, message: userMessage }];
    setChatMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await sendMessageToGroq(chatMessages, userMessage);
      setChatMessages(prev => [...prev, { type: 'bot', message: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        message: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or feel free to email us directly at Vrishankjo@gmail.com for food analysis.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSendToEmail = () => {
    const subject = encodeURIComponent('Food Analysis Request - Nutrition Label');
    const body = encodeURIComponent(`Hi FoodCheck Team,

I would like to request a food analysis. I will attach a clear photo of the nutrition label.

Please provide a comprehensive analysis including:
- Nutrition breakdown
- Health assessment  
- Taste evaluation

Thank you!`);
    
    const mailtoLink = `mailto:vrishankjo@gmail.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Dark Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <FoodCheckLogo className="h-10 w-10" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                    FoodCheck
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Analyze. Understand. Choose Better.</p>
                </div>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setShowVisionAnalysis(true)}
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                AI Analysis
              </button>
              <button 
                onClick={() => setShowChatbot(true)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Chat Assistant
              </button>
              <button 
                onClick={handleSendToEmail}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Email Analysis
              </button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Welcome back!</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Admin Panel"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Analyze Your Food with
            <span className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent block">
              AI-Powered Precision
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get comprehensive nutrition analysis, health warnings, and taste evaluations for any packaged food. 
            Make informed choices with our revolutionary Vish Score system.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => setShowVisionAnalysis(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <Camera className="h-6 w-6 mr-3" />
              Start AI Analysis
            </button>
            <button
              onClick={handleSendToEmail}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <Mail className="h-6 w-6 mr-3" />
              Email Analysis
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              <span>Health-Focused</span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
              <span>Comprehensive Scoring</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* AI Vision Analysis */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Vision Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Upload a photo of any nutrition label and get instant, comprehensive analysis powered by advanced AI vision technology.
            </p>
            <button
              onClick={() => setShowVisionAnalysis(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full"
            >
              Try AI Analysis
            </button>
          </div>

          {/* Email Analysis */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Email Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Send nutrition label photos via email and receive detailed analysis reports within 1-20 minutes. Perfect for detailed reviews.
            </p>
            <button
              onClick={handleSendToEmail}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full"
            >
              Send Email
            </button>
          </div>

          {/* Chat Assistant */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Chat Assistant</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Ask questions about nutrition, health conditions, and food choices. Get personalized advice from our AI nutritionist.
            </p>
            <button
              onClick={() => setShowChatbot(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full"
            >
              Start Chatting
            </button>
          </div>
        </div>

        {/* Vish Score Section */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-white mb-16 shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Star className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-6">Introducing Vish Score</h3>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-95">
              The world's first comprehensive scoring system that evaluates both 
              <span className="font-bold"> nutrition AND taste quality</span> in one revolutionary score.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <BarChart3 className="h-8 w-8 mb-4 mx-auto" />
                <h4 className="text-xl font-bold mb-2">Nutrition Analysis</h4>
                <p className="opacity-90">Complete health impact assessment with personalized warnings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <Heart className="h-8 w-8 mb-4 mx-auto" />
                <h4 className="text-xl font-bold mb-2">Taste Evaluation</h4>
                <p className="opacity-90">Advanced flavor profiling and sensory analysis</p>
              </div>
            </div>
            <button
              onClick={handleSendToEmail}
              className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Get Your Vish Score
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">How FoodCheck Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upload or Email</h4>
              <p className="text-gray-600 dark:text-gray-300">Take a photo of the nutrition label or send it via email</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Analysis</h4>
              <p className="text-gray-600 dark:text-gray-300">Our advanced AI analyzes nutrition, health impact, and taste</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Results</h4>
              <p className="text-gray-600 dark:text-gray-300">Receive comprehensive analysis with personalized recommendations</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FoodCheckLogo className="h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                FoodCheck
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Empowering better food choices through comprehensive AI analysis
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="mailto:vrishankjo@gmail.com" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Contact Us
              </a>
              <span>•</span>
              <span>Non-profit initiative</span>
              <span>•</span>
              <span>Made with ❤️ for healthier eating</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showVisionAnalysis && (
        <VisionAnalysis 
          onClose={() => setShowVisionAnalysis(false)}
          onCameraAnalysis={handleCameraAnalysis}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* Chatbot */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col transition-colors duration-300">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-full">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Nutrition Assistant</h3>
                    <p className="text-blue-100">Ask me anything about food and nutrition!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChatbot(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Welcome to FoodCheck AI!</p>
                  <p className="text-sm">Ask me about nutrition, health conditions, or food analysis.</p>
                  <div className="mt-4 space-y-2 text-xs">
                    <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg inline-block">
                      "What is the Vish Score?"
                    </p>
                    <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg inline-block">
                      "How do I analyze food for diabetes?"
                    </p>
                  </div>
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about nutrition, health, or food analysis..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;