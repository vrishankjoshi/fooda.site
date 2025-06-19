import React, { useState, useEffect } from 'react';
import { Heart, BarChart3, CheckCircle, Target, Zap, Shield, Award, ArrowRight, Star, TrendingUp, Camera, X, Upload, Info, Clock, MessageCircle, Send, Loader2, Eye, Mail, Calendar, Users, LogOut, User as UserIcon } from 'lucide-react';
import { sendMessageToGroq, ChatMessage } from './services/groqService';
import { VisionAnalysis } from './components/VisionAnalysis';
import { FoodCheckLogo } from './components/FoodCheckLogo';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { NutritionAnalysis } from './services/visionService';

function App() {
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('home');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { type: 'bot', message: 'Hello! I\'m your FoodCheck AI assistant. I can help you understand food nutrition, health impacts, and answer any questions about our analysis process. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Rating system state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [userEngagement, setUserEngagement] = useState({
    chatMessages: 0,
    visionAnalyses: 0,
    lastActivity: Date.now()
  });

  // Check for hourly rating prompt
  useEffect(() => {
    const checkRatingPrompt = () => {
      const lastRatingTime = localStorage.getItem('foodcheck_last_rating_time');
      const engagement = JSON.parse(localStorage.getItem('foodcheck_user_engagement') || '{"chatMessages":0,"visionAnalyses":0,"lastActivity":0}');
      
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      // Check if user has been active and an hour has passed
      if (engagement.chatMessages > 0 || engagement.visionAnalyses > 0) {
        if (!lastRatingTime || (now - parseInt(lastRatingTime)) >= oneHour) {
          setShowRatingModal(true);
        }
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkRatingPrompt, 5 * 60 * 1000);
    
    // Check immediately on load
    setTimeout(checkRatingPrompt, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Update engagement tracking
  useEffect(() => {
    localStorage.setItem('foodcheck_user_engagement', JSON.stringify(userEngagement));
  }, [userEngagement]);

  const handleStartAnalysis = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setShowModal(true);
  };

  const handleVisionAnalysis = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setShowVisionModal(true);
    setUserEngagement(prev => ({
      ...prev,
      visionAnalyses: prev.visionAnalyses + 1,
      lastActivity: Date.now()
    }));
  };

  const handleLearnMore = () => {
    setShowLearnMoreModal(true);
  };

  const handleAuthSuccess = (userData: { email: string; name: string }) => {
    login(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    setChatMessages([
      { type: 'bot', message: 'Hello! I\'m your FoodCheck AI assistant. I can help you understand food nutrition, health impacts, and answer any questions about our analysis process. How can I help you today?' }
    ]);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeVisionModal = () => {
    setShowVisionModal(false);
  };

  const closeLearnMoreModal = () => {
    setShowLearnMoreModal(false);
  };

  const navigateToPage = (page: string) => {
    setCurrentPage(page);
  };

  const handleCameraAnalysis = (analysis: NutritionAnalysis) => {
    // Create a comprehensive analysis message for the chatbot
    const analysisMessage = `I just analyzed your nutrition label! Here's what I found:

🎯 **Overall Grade: ${analysis.overall.grade}**
${analysis.overall.summary}

📊 **NUTRITION BREAKDOWN:**
• Calories: ${analysis.nutrition.calories}
• Total Fat: ${analysis.nutrition.totalFat}
• Sodium: ${analysis.nutrition.sodium}
• Total Carbohydrates: ${analysis.nutrition.totalCarbohydrates}
• Protein: ${analysis.nutrition.protein}

🏥 **HEALTH ANALYSIS (Score: ${analysis.health.score}/100):**
${analysis.health.warnings.length > 0 ? 
  `⚠️ Health Warnings:\n${analysis.health.warnings.map(w => `• ${w}`).join('\n')}` : 
  '✅ No major health concerns identified'}

${analysis.health.recommendations.length > 0 ? 
  `\n💡 Recommendations:\n${analysis.health.recommendations.map(r => `• ${r}`).join('\n')}` : ''}

🍽️ **TASTE PROFILE (Score: ${analysis.taste.score}/100):**
${analysis.taste.description}
Taste characteristics: ${analysis.taste.profile.join(', ')}

${analysis.health.allergens.length > 0 ? 
  `\n🚨 Potential Allergens: ${analysis.health.allergens.join(', ')}` : ''}

Feel free to ask me any questions about this analysis or if you'd like more details about any specific aspect!`;

    // Add the analysis to chat messages
    setChatMessages(prev => [...prev, { type: 'bot', message: analysisMessage }]);
    
    // Close vision modal and navigate to chat
    setShowVisionModal(false);
    setCurrentPage('chat');
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      const userMsg = inputMessage.trim();
      setChatMessages(prev => [...prev, { type: 'user', message: userMsg }]);
      setInputMessage('');
      setIsLoading(true);

      // Update engagement
      setUserEngagement(prev => ({
        ...prev,
        chatMessages: prev.chatMessages + 1,
        lastActivity: Date.now()
      }));

      try {
        const response = await sendMessageToGroq(chatMessages, userMsg);
        setChatMessages(prev => [...prev, { type: 'bot', message: response }]);
      } catch (error) {
        setChatMessages(prev => [...prev, { 
          type: 'bot', 
          message: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or feel free to email us directly at Vrishankjo@gmail.com for food analysis.' 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  const handleRatingSubmit = (rating: number) => {
    setSelectedRating(rating);
    setShowThankYou(true);
    
    // Store rating data
    const ratingData = {
      rating,
      timestamp: Date.now(),
      page: currentPage,
      user: user?.email || 'anonymous'
    };
    
    const existingRatings = JSON.parse(localStorage.getItem('foodcheck_ratings') || '[]');
    existingRatings.push(ratingData);
    localStorage.setItem('foodcheck_ratings', JSON.stringify(existingRatings));
    localStorage.setItem('foodcheck_last_rating_time', Date.now().toString());
    
    // Close modal after showing thank you
    setTimeout(() => {
      setShowRatingModal(false);
      setShowThankYou(false);
      setSelectedRating(null);
    }, 2000);
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FoodCheckLogo className="h-8 w-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FoodCheck...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'chat') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-2">
                <button onClick={() => navigateToPage('home')} className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-xl">
                    <FoodCheckLogo className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    FoodCheck
                  </span>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                  </div>
                )}
                <button 
                  onClick={handleVisionAnalysis}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Analyze Another
                </button>
                <button 
                  onClick={() => navigateToPage('home')}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Back to Home
                </button>
                {isAuthenticated && (
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-full">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">FoodCheck AI Assistant</h1>
                  <p className="text-green-100">Ask me anything about food nutrition and health</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl max-w-xs lg:max-w-md">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
              <button 
                onClick={() => setShowRatingModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                {showThankYou ? (
                  <>
                    <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
                    <p className="text-gray-600 mb-4">
                      You rated FoodCheck <span className="font-bold text-green-600">{selectedRating}/10</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Your feedback helps us improve our service!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Rate Your Experience</h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      How would you rate FoodCheck on a scale of 1 to 10?
                    </p>
                    
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingSubmit(rating)}
                          className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      1 = Poor, 10 = Excellent
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentPage === 'how-it-works') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-2">
                <button onClick={() => navigateToPage('home')} className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-xl">
                    <FoodCheckLogo className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    FoodCheck
                  </span>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                  </div>
                )}
                <button 
                  onClick={() => navigateToPage('home')}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Back to Home
                </button>
                {isAuthenticated && (
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* How It Works Content */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                How Food Analysis Works
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our systematic approach ensures accurate and comprehensive food evaluation through advanced AI technology and scientific analysis
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-xl w-fit mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Product Scan & Upload</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Simply take a clear photo of the nutrition facts label and send it to our analysis email. Our AI immediately begins processing the image to extract all nutritional data.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl w-fit mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Advanced Data Analysis</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our sophisticated algorithms analyze nutritional content, ingredients, additives, and cross-reference with health databases to understand the complete food profile.
                  </p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl w-fit mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Health Impact Assessment</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We evaluate health implications, check for allergens, assess additives, and provide personalized warnings based on common health conditions like diabetes, heart disease, and allergies.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <div className="bg-gradient-to-r from-pink-500 to-red-500 p-3 rounded-xl w-fit mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Comprehensive Report</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive a detailed analysis report within 1-20 minutes, including nutrition breakdown, health scores, taste evaluation, and personalized recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Process */}
            <div className="bg-white rounded-2xl shadow-xl p-12 mb-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Analysis Process</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="bg-green-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-10 w-10 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Nutrition Analysis</h4>
                  <p className="text-gray-600">Complete breakdown of macronutrients, micronutrients, vitamins, and minerals with daily value percentages.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Star className="h-10 w-10 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Taste Evaluation</h4>
                  <p className="text-gray-600">Scientific taste profiling using flavor compounds analysis and consumer preference data.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Health Assessment</h4>
                  <p className="text-gray-600">Comprehensive health impact evaluation including personalized warnings for medical conditions.</p>
                </div>

                <div className="text-center">
                  <div className="bg-yellow-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-10 w-10 text-yellow-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Vish Score</h4>
                  <p className="text-gray-600">Our revolutionary scoring system that combines nutrition and taste quality for comprehensive food evaluation.</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-12 rounded-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Analyze Your Food?</h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Join thousands of users who trust FoodCheck for comprehensive food analysis and personalized health insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={handleVisionAnalysis}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    AI Vision Analysis
                  </button>
                  <button 
                    onClick={handleStartAnalysis}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    Email Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleLearnMore}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    About Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showVisionModal && <VisionAnalysis onClose={closeVisionModal} onCameraAnalysis={handleCameraAnalysis} />}
        
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Food Analysis</h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Please send a clear picture of the nutrition label where the calories are located to get started with your comprehensive food analysis.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Upload className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Send your photo to:</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">Vrishankjo@gmail.com</p>
                </div>
                
                <div className="text-sm text-gray-500 mb-6">
                  Make sure the nutrition facts panel is clearly visible and well-lit for the most accurate analysis.
                </div>
                
                <button 
                  onClick={closeModal}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        )}

        {showLearnMoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={closeLearnMoreModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Info className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-6">About FoodCheck</h3>
                
                <div className="text-left space-y-4 mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    This company is a non-profit organization where we tell people how healthy their food or drink is, and it helps people's lives.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Personalized Health Insights</h4>
                    <p className="text-gray-700 text-sm">
                      For example, if you have diabetes and tell our secret AI using the email provided, it will say in the health section: <span className="font-medium text-red-600">"Don't eat if you have diabetes - it will make it worse"</span>
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">Quick Results</h4>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Get your comprehensive food analysis results in just <span className="font-medium text-green-600">1-20 minutes</span> after submitting your nutrition label photo.
                    </p>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    Our mission is to empower people to make better food choices through accurate, personalized health assessments that consider individual dietary needs and medical conditions.
                  </p>
                </div>
                
                <button 
                  onClick={closeLearnMoreModal}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-xl">
                <FoodCheckLogo className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                FoodCheck
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
              <button 
                onClick={() => navigateToPage('how-it-works')}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                How It Works
              </button>
              <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</a>
              {isAuthenticated && (
                <button 
                  onClick={() => navigateToPage('chat')}
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Talk to AI
                </button>
              )}
            </nav>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                  </div>
                  <button 
                    onClick={handleVisionAnalysis}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    AI Vision
                  </button>
                  <button 
                    onClick={handleStartAnalysis}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Get Started
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Know What You're
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Eating</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the complete nutritional profile, taste quality, and health impact of packaged foods with our comprehensive analysis tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={handleVisionAnalysis}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <Eye className="mr-2 h-5 w-5" />
                AI Vision Analysis
              </button>
              <button 
                onClick={handleStartAnalysis}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                Email Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={handleLearnMore}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Four Pillars of Food Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive approach examines every aspect of packaged food quality
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Nutrition Analysis */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-500 p-3 rounded-xl w-fit mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nutrition Analysis</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Deep dive into macronutrients, micronutrients, vitamins, minerals, and caloric content with detailed breakdowns and daily value percentages.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Macro & micronutrient breakdown
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Vitamin & mineral analysis
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Daily value calculations
                </li>
              </ul>
            </div>

            {/* Taste Evaluation */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-500 p-3 rounded-xl w-fit mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Taste Evaluation</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Scientific taste profiling using sensory analysis, flavor compounds identification, and consumer preference data.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  Sensory analysis scoring
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  Flavor profile mapping
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                  Consumer preference data
                </li>
              </ul>
            </div>

            {/* Health Assessment */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-500 p-3 rounded-xl w-fit mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Health Assessment</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Comprehensive health impact evaluation including additives, preservatives, allergens, and overall wellness scoring.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                  Additive & preservative check
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                  Allergen identification
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                  Health impact scoring
                </li>
              </ul>
            </div>

            {/* Vish Score */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-yellow-500 p-3 rounded-xl w-fit mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vish Score</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our revolutionary scoring system that combines nutrition and taste quality for comprehensive food evaluation and decision making.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-yellow-500 mr-3" />
                  Combined nutrition & taste scoring
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-yellow-500 mr-3" />
                  Comprehensive food evaluation
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-yellow-500 mr-3" />
                  Personalized recommendations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Food Analysis Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our systematic approach ensures accurate and comprehensive food evaluation
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Product Scan</h3>
              <p className="text-gray-600">
                Scan or input product barcode to access comprehensive product database
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Data Analysis</h3>
              <p className="text-gray-600">
                Advanced algorithms analyze nutritional content, ingredients, and health markers
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Quality Check</h3>
              <p className="text-gray-600">
                Cross-reference with health databases and taste preference algorithms
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">4. Report Generation</h3>
              <p className="text-gray-600">
                Receive detailed analysis report with recommendations and scores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-4xl font-bold text-green-600 mb-2">500K+</div>
              <div className="text-gray-600 text-lg">Products Analyzed</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600 text-lg">Accuracy Rate</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-gray-600 text-lg">Users Trust Us</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We'd love to hear from you about meetings, improvements, or just to chat about FoodCheck
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule a Meeting</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Want to discuss partnerships, collaborations, or learn more about our technology? We'd be happy to schedule a meeting with you.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Share Your Ideas</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Have suggestions for improving our website or service? We value your feedback and are always looking to enhance the user experience.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">General Inquiries</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Questions about FoodCheck, our mission, or how we can help you make better food choices? Let's start a conversation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Connect?</h3>
                <p className="text-gray-600 mb-6">
                  Whether you want to schedule a meeting, suggest improvements, or just chat about FoodCheck, we're here to listen.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-center mb-3">
                  <Mail className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Send us a message:</span>
                </div>
                <p className="text-xl font-bold text-green-600 text-center">vrishankjo@gmail.com</p>
              </div>
              
              <div className="text-sm text-gray-600 text-center mb-6">
                We typically respond within 24 hours and look forward to hearing from you!
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleVisionAnalysis}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Try AI Vision Analysis
                </button>
                <button 
                  onClick={handleStartAnalysis}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Start Food Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-xl">
                  <FoodCheckLogo className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">FoodCheck</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering better food choices through comprehensive analysis and insights.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Nutrition Analysis</li>
                <li>Taste Evaluation</li>
                <li>Health Assessment</li>
                <li>Vish Score</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>How It Works</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Support</li>
                <li>FAQ</li>
                <li>Contact Us</li>
                <li>Feedback</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FoodCheck. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Vision Analysis Modal */}
      {showVisionModal && <VisionAnalysis onClose={closeVisionModal} onCameraAnalysis={handleCameraAnalysis} />}

      {/* Photo Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Camera className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Food Analysis</h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Send a clear picture of the nutrition label to get started with your comprehensive food analysis.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Upload className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Send your photo to:</span>
                </div>
                <p className="text-lg font-semibold text-green-600">vrishankjo@gmail.com</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-700 font-medium mb-2">
                  ⚡ Want instant results?
                </p>
                <button
                  onClick={() => {
                    closeModal();
                    handleVisionAnalysis();
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center mx-auto"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Use Vision Analysis
                </button>
              </div>
              
              <div className="text-sm text-gray-500 mb-6">
                Make sure the nutrition facts panel is clearly visible and well-lit for the most accurate analysis.
              </div>
              
              <button 
                onClick={closeModal}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={closeLearnMoreModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Info className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6">About FoodCheck</h3>
              
              <div className="text-left space-y-4 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  This company is a non-profit organization where we tell people how healthy their food or drink is, and it helps people's lives.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Personalized Health Insights</h4>
                  <p className="text-gray-700 text-sm">
                    For example, if you have diabetes and tell our secret AI using the email provided, it will say in the health section: <span className="font-medium text-red-600">"Don't eat if you have diabetes - it will make it worse"</span>
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Quick Results</h4>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Get your comprehensive food analysis results in just <span className="font-medium text-green-600">1-20 minutes</span> after submitting your nutrition label photo.
                  </p>
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  Our mission is to empower people to make better food choices through accurate, personalized health assessments that consider individual dietary needs and medical conditions.
                </p>
              </div>
              
              <button 
                onClick={closeLearnMoreModal}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button 
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              {showThankYou ? (
                <>
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
                  <p className="text-gray-600 mb-4">
                    You rated FoodCheck <span className="font-bold text-green-600">{selectedRating}/10</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Your feedback helps us improve our service!
                  </p>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Rate Your Experience</h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    How would you rate FoodCheck on a scale of 1 to 10?
                  </p>
                  
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingSubmit(rating)}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    1 = Poor, 10 = Excellent
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;