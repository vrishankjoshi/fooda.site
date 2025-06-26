import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe, MessageCircle, Camera, Mail, Star, BarChart3, Heart, Users, TrendingUp, Award, Zap, Brain, Beaker, Eye, History, UserPlus, Settings, HelpCircle, Play, Search } from 'lucide-react';
import { VisionAnalysis } from './components/VisionAnalysis';
import { ChatAssistant } from './components/ChatAssistant';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { AnalysisHistory } from './components/AnalysisHistory';
import { ImageGallery } from './components/ImageGallery';
import { Tour } from './components/Tour';
import { FoodSearch } from './components/FoodSearch';
import { FoodCheckLogo } from './components/FoodCheckLogo';
import { useAuth } from './hooks/useAuth';
import { NutritionAnalysis } from './services/visionService';
import { emailService } from './services/emailService';
import { FoodItem } from './services/foodDatabaseService';

type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'hi';

interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
}

const languages: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [showVisionAnalysis, setShowVisionAnalysis] = useState(false);
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAnalysisHistory, setShowAnalysisHistory] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [analysisForChat, setAnalysisForChat] = useState<NutritionAnalysis | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  // Check if user has seen the tour
  useEffect(() => {
    const tourSeen = localStorage.getItem('foodcheck_tour_seen');
    setHasSeenTour(!!tourSeen);
  }, []);

  // Auto-show tour for new users
  useEffect(() => {
    if (!isLoading && !hasSeenTour) {
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasSeenTour]);

  // Dark mode persistence
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCameraAnalysis = (analysis: NutritionAnalysis) => {
    setAnalysisForChat(analysis);
    setShowChatAssistant(true);
  };

  const handleAuthSuccess = (userData: { email: string; name: string }) => {
    login(userData);
    setShowAuthModal(false);
    
    // Register user for email communications
    emailService.registerUser(userData.name, userData.email).catch(console.error);
  };

  const handleTourComplete = () => {
    localStorage.setItem('foodcheck_tour_seen', 'true');
    setHasSeenTour(true);
  };

  const handleFoodSelect = (food: FoodItem) => {
    console.log('Selected food:', food);
    // You can add logic here to do something with the selected food
    // For example, show detailed analysis or add to favorites
    setShowFoodSearch(false);
  };

  // Admin panel access (simple check - in production, use proper authentication)
  const handleAdminAccess = () => {
    const adminPassword = prompt('Enter admin password:');
    if (adminPassword === 'foodcheck2024') {
      setShowAdminPanel(true);
    } else {
      alert('Invalid password');
    }
  };

  const sendWelcomeEmails = async () => {
    try {
      await emailService.sendWelcomeEmailToAll();
      alert('Welcome emails sent to all users!');
    } catch (error) {
      alert('Error sending emails: ' + error);
    }
  };

  const sendHiMessages = async () => {
    try {
      await emailService.sendHiToAllUsers();
      alert('Hi messages sent to all users! 👋');
    } catch (error) {
      alert('Error sending Hi messages: ' + error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading FoodCheck...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 foodcheck-logo">
              <FoodCheckLogo className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">FoodCheck</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">AI Food Analysis</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6 main-navigation">
              <button
                onClick={() => setShowVisionAnalysis(true)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Camera className="h-4 w-4" />
                <span>AI Analysis</span>
              </button>
              <button
                onClick={() => setShowChatAssistant(true)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat Assistant</span>
              </button>
              <button
                onClick={() => setShowFoodSearch(true)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Food Database</span>
              </button>
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative language-selector">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{languages.find(l => l.code === currentLanguage)?.flag}</span>
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 ${
                          currentLanguage === lang.code ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors dark-mode-toggle"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 auth-buttons">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Hi, {user?.name}!
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowAnalysisHistory(true)}
                        className="p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Analysis History"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowImageGallery(true)}
                        className="p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Image Gallery"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowTour(true)}
                        className="p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Take Tour"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={logout}
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        Logout
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
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                      }}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-20 transition-colors duration-300 hero-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Analyze Your Food with{' '}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  AI Intelligence
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Get comprehensive nutrition analysis, health warnings, taste evaluation, and consumer insights 
                for any packaged food. Powered by advanced AI and our revolutionary Vish Score system.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setShowVisionAnalysis(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 cta-button"
              >
                <Camera className="h-6 w-6" />
                <span>Start AI Analysis</span>
              </button>
              
              <button
                onClick={() => setShowFoodSearch(true)}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
              >
                <Search className="h-6 w-6" />
                <span>Search Food Database</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">1-20min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Analysis Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">3 Pillars</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Nutrition, Taste, Consumer</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">AI Powered</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Advanced Analysis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">Free</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Non-profit Service</div>
              </div>
            </div>
          </div>
        </section>

        {/* Email Analysis Section */}
        <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300 email-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                📧 Email Analysis Service
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Send clear photos of nutrition labels to our email for comprehensive analysis. 
                Perfect for detailed reports and personalized health recommendations.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center">
              <div className="max-w-4xl mx-auto">
                <Mail className="h-16 w-16 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-4">Send to: Vrishankjo@gmail.com</h3>
                <p className="text-xl mb-6 text-green-100">
                  📸 Attach clear photos of nutrition labels<br/>
                  ⏱️ Get detailed analysis in 1-20 minutes<br/>
                  🎯 Personalized health warnings & recommendations
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white bg-opacity-20 p-6 rounded-lg">
                    <Camera className="h-8 w-8 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">1. Take Photos</h4>
                    <p className="text-sm text-green-100">Clear, well-lit nutrition label photos</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-6 rounded-lg">
                    <Mail className="h-8 w-8 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">2. Send Email</h4>
                    <p className="text-sm text-green-100">Email to Vrishankjo@gmail.com</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-6 rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">3. Get Analysis</h4>
                    <p className="text-sm text-green-100">Comprehensive Vish Score report</p>
                  </div>
                </div>

                <a
                  href="mailto:Vrishankjo@gmail.com?subject=Food Analysis Request&body=Hi FoodCheck Team,%0D%0A%0D%0AI would like to request a food analysis. I have attached clear photos of the nutrition label.%0D%0A%0D%0APlease provide a comprehensive analysis including:%0D%0A- Nutrition breakdown%0D%0A- Health assessment%0D%0A- Taste evaluation%0D%0A- Consumer insights%0D%0A%0D%0AThank you!"
                  className="inline-block bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors mt-6"
                >
                  📧 Open Email App
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Choose Your Analysis Method
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Multiple ways to get comprehensive food analysis powered by AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* AI Vision Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ai-vision-card">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Vision Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Upload photos instantly and get real-time analysis powered by advanced computer vision and AI.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Zap className="h-5 w-5 text-green-500 mr-3" />
                    Instant analysis in seconds
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Brain className="h-5 w-5 text-blue-500 mr-3" />
                    Advanced AI processing
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Eye className="h-5 w-5 text-purple-500 mr-3" />
                    Computer vision technology
                  </li>
                </ul>
                <button
                  onClick={() => setShowVisionAnalysis(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Try AI Vision
                </button>
              </div>

              {/* Chat Assistant Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 chat-assistant-card">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Chat Assistant</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ask questions about nutrition, health conditions, and get personalized advice from our AI.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <MessageCircle className="h-5 w-5 text-purple-500 mr-3" />
                    Natural conversation
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Heart className="h-5 w-5 text-red-500 mr-3" />
                    Health condition advice
                  </li>
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Beaker className="h-5 w-5 text-green-500 mr-3" />
                    Nutrition science insights
                  </li>
                </ul>
                <button
                  onClick={() => setShowChatAssistant(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Start Chatting
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Vish Score Section */}
        <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300 vish-score-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-2xl font-bold inline-block mb-6">
                ⭐ Revolutionary Vish Score System
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                The World's First Comprehensive Food Rating
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Unlike other systems that only consider nutrition, our Vish Score evaluates food across 
                three critical dimensions for a complete picture of food quality.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-2xl mb-6">
                  <BarChart3 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nutrition Analysis</h3>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">33.3%</div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete macro and micronutrient breakdown with health impact assessment
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-2xl mb-6">
                  <Star className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Taste Quality</h3>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">33.3%</div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Advanced flavor profiling and sensory analysis for taste satisfaction
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-6 rounded-2xl mb-6">
                  <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Consumer Rating</h3>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">33.3%</div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Real user feedback and satisfaction scores from actual consumers
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 text-center">
              <Award className="h-16 w-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Final Vish Score = (Nutrition + Taste + Consumer) ÷ 3
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                This revolutionary approach ensures you get foods that are not only healthy but also 
                taste great AND have proven consumer satisfaction.
              </p>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg inline-block">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  85/100
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Example Vish Score</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 how-it-works-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Simple 3-step process to get comprehensive food analysis
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload or Email</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Take a clear photo of the nutrition label and either upload it instantly or email it to us
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our advanced AI analyzes nutrition, taste quality, and consumer satisfaction data
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Get Results</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Receive comprehensive Vish Score with personalized recommendations in 1-20 minutes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300 features-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                What Makes FoodCheck Special
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Comprehensive analysis that goes beyond basic nutrition facts
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Deep Nutrition Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Complete breakdown of macros, micros, vitamins, and minerals with health impact assessment
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Taste Science</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Advanced flavor profiling using food science principles to predict taste satisfaction
                </p>
              </div>

              <div className="text-center">
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Personalized Warnings</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Custom health alerts based on your conditions like diabetes, heart disease, allergies
                </p>
              </div>

              <div className="text-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unified Scoring</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Single Vish Score that balances health, taste, and consumer satisfaction
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Controls (Hidden) */}
        <div className="fixed bottom-4 right-4 space-y-2">
          <button
            onClick={handleAdminAccess}
            className="bg-gray-800 text-white p-2 rounded-full opacity-20 hover:opacity-100 transition-opacity"
            title="Admin Panel"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={sendWelcomeEmails}
            className="bg-blue-600 text-white p-2 rounded-full opacity-20 hover:opacity-100 transition-opacity"
            title="Send Welcome Emails"
          >
            <Mail className="h-4 w-4" />
          </button>
          <button
            onClick={sendHiMessages}
            className="bg-green-600 text-white p-2 rounded-full opacity-20 hover:opacity-100 transition-opacity"
            title="Send Hi Messages"
          >
            <UserPlus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowTour(true)}
            className="bg-purple-600 text-white p-2 rounded-full opacity-20 hover:opacity-100 transition-opacity"
            title="Show Tour"
          >
            <Play className="h-4 w-4" />
          </button>
        </div>
      </main>

      {/* Modals */}
      {showVisionAnalysis && (
        <VisionAnalysis 
          onClose={() => setShowVisionAnalysis(false)}
          onCameraAnalysis={handleCameraAnalysis}
        />
      )}

      {showChatAssistant && (
        <ChatAssistant 
          isOpen={showChatAssistant}
          onClose={() => {
            setShowChatAssistant(false);
            setAnalysisForChat(null);
          }}
          initialAnalysis={analysisForChat}
        />
      )}

      {showFoodSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-full">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Food Database Search</h2>
                    <p className="text-green-100">Search thousands of foods with comprehensive nutrition data</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowFoodSearch(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Search Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <FoodSearch 
                onFoodSelect={handleFoodSelect}
                placeholder="Search for Indian foods like Atta, Frooti, Besan, or any packaged food..."
                showFilters={true}
                maxResults={20}
              />
            </div>
          </div>
        </div>
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

      {showAnalysisHistory && (
        <AnalysisHistory 
          isOpen={showAnalysisHistory}
          onClose={() => setShowAnalysisHistory(false)}
        />
      )}

      {showImageGallery && (
        <ImageGallery 
          isOpen={showImageGallery}
          onClose={() => setShowImageGallery(false)}
        />
      )}

      {showTour && (
        <Tour 
          isOpen={showTour}
          onClose={() => setShowTour(false)}
          onComplete={handleTourComplete}
        />
      )}

      {/* Click outside to close language dropdown */}
      {showLanguageDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLanguageDropdown(false)}
        />
      )}
    </div>
  );
}

export default App;