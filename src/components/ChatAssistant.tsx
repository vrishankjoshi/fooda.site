import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, MessageCircle, Mic, MicOff, Volume2, VolumeX, Pause, Play, Settings } from 'lucide-react';
import { sendMessageToGroq, ChatMessage } from '../services/groqService';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialAnalysis?: any;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose, initialAnalysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthSupported, setSynthSupported] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1,
    volume: 0.8,
    voice: ''
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      setSynthSupported(true);
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        setAvailableVoices(englishVoices);
        
        if (englishVoices.length > 0 && !voiceSettings.voice) {
          const preferredVoice = englishVoices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.name.includes('Alex') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Natural')
          ) || englishVoices[0];
          
          if (preferredVoice) {
            setVoiceSettings(prev => ({ ...prev, voice: preferredVoice.name }));
          }
        }
      };

      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Initialize with welcome message and analysis if provided
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = initialAnalysis 
        ? `Hello! I see you've analyzed a food item. I can help you understand the results, answer nutrition questions, or provide personalized advice. What would you like to know?`
        : `Hello! I'm your AI nutrition assistant. I can help you with:

🍎 Nutrition questions and advice
🏥 Health condition-specific recommendations  
📊 Understanding food analysis results
⭐ Information about our Vish Score system
🥗 Meal planning and healthy eating tips

What would you like to know?`;

      const botMessage: ChatMessage = {
        type: 'bot',
        message: welcomeMessage
      };
      
      setMessages([botMessage]);
      
      // Speak welcome message if voice is enabled
      if (voiceEnabled && synthSupported) {
        setTimeout(() => speakMessage(welcomeMessage), 500);
      }
    }
  }, [isOpen, initialAnalysis, voiceEnabled, synthSupported]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech-to-text functions
  const startListening = () => {
    if (recognitionRef.current && speechSupported && voiceEnabled) {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Text-to-speech functions
  const speakMessage = (text: string) => {
    if (!synthRef.current || !voiceEnabled || !synthSupported) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Clean text for better speech
    const cleanText = text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '') // Remove markdown italic
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
      .replace(/`([^`]+)`/g, '$1') // Remove code formatting
      .replace(/\n+/g, '. ') // Convert line breaks to pauses
      .replace(/•/g, '') // Remove bullet points
      .replace(/🎯|📊|🍽️|👥|✨|🚀|💡|⭐|📧|🤖|💬|🌟|🍎|🏥|🥗/g, '') // Remove emojis
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // Set voice
    const selectedVoice = availableVoices.find(voice => voice.name === voiceSettings.voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isSpeaking) {
      stopSpeaking();
    }
    if (isListening) {
      stopListening();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      message: inputMessage.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessageToGroq(messages, userMessage.message);
      const botMessage: ChatMessage = {
        type: 'bot',
        message: response
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if voice is enabled
      if (voiceEnabled && synthSupported) {
        setTimeout(() => speakMessage(response), 300);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        type: 'bot',
        message: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full h-[80vh] flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Nutrition Assistant</h2>
                <p className="text-green-100">Ask me anything about food, nutrition, and Vish Score!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Voice toggle */}
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-full transition-colors ${
                  voiceEnabled 
                    ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30' 
                    : 'bg-gray-500 text-gray-300 hover:bg-gray-400'
                }`}
                title={voiceEnabled ? 'Disable voice features' : 'Enable voice features'}
              >
                {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
              
              {/* Speaking indicator / stop button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors animate-pulse"
                  title="Stop speaking"
                >
                  <Pause className="h-5 w-5" />
                </button>
              )}

              {/* Voice settings */}
              {synthSupported && (
                <div className="relative">
                  <button
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    className="p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
                    title="Voice settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>

                  {/* Voice Settings Dropdown */}
                  {showVoiceSettings && (
                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 min-w-64">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Voice Settings</h3>
                      
                      {/* Voice selection */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Voice</label>
                        <select
                          value={voiceSettings.voice}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
                          className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-600 dark:text-white"
                        >
                          {availableVoices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Rate control */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Speed: {voiceSettings.rate.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={voiceSettings.rate}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>

                      {/* Pitch control */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Pitch: {voiceSettings.pitch.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={voiceSettings.pitch}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>

                      {/* Volume control */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Volume: {Math.round(voiceSettings.volume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={voiceSettings.volume}
                          onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>

                      {/* Test button */}
                      <button
                        onClick={() => speakMessage("Hello! This is a test of the voice settings. How do I sound?")}
                        disabled={isSpeaking}
                        className="w-full bg-blue-500 text-white text-xs py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isSpeaking ? 'Speaking...' : 'Test Voice'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Voice status indicator */}
          <div className="mt-3 flex items-center space-x-4 text-sm text-green-100">
            {speechSupported && (
              <div className="flex items-center space-x-1">
                <Mic className="h-4 w-4" />
                <span>Voice input available</span>
              </div>
            )}
            {synthSupported && voiceEnabled && (
              <div className="flex items-center space-x-1">
                <Volume2 className="h-4 w-4" />
                <span>Voice responses enabled</span>
              </div>
            )}
            {isListening && (
              <div className="flex items-center space-x-1 text-red-200 animate-pulse">
                <MicOff className="h-4 w-4" />
                <span>Listening...</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center space-x-1 text-blue-200 animate-pulse">
                <Volume2 className="h-4 w-4" />
                <span>Speaking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.message}</div>
                
                {/* Speak button for bot messages */}
                {message.type === 'bot' && synthSupported && voiceEnabled && (
                  <button
                    onClick={() => speakMessage(message.message)}
                    className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-1 transition-colors"
                    disabled={isSpeaking}
                  >
                    <Play className="h-3 w-3" />
                    <span>Speak this message</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                <span className="text-gray-600 dark:text-gray-300">Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600">
          {/* MASSIVE VOICE BUTTON SECTION - ALWAYS VISIBLE */}
          <div className="mb-6 p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
            <div className="text-center mb-4">
              <h2 className="text-white text-2xl font-bold mb-2">🎤 VOICE INPUT</h2>
              <p className="text-pink-100 text-lg">Click the giant button below to speak!</p>
            </div>
            
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || !voiceEnabled || !speechSupported}
              className={`w-full py-8 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-4 font-black text-2xl shadow-2xl ${
                isListening 
                  ? 'bg-red-600 text-white animate-bounce scale-110 border-8 border-red-300' 
                  : speechSupported && voiceEnabled
                    ? 'bg-white text-red-600 hover:bg-gray-100 hover:scale-105 border-4 border-white'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              }`}
              style={{ 
                minHeight: '120px',
                fontSize: '28px',
                fontWeight: '900'
              }}
            >
              {isListening ? (
                <>
                  <MicOff className="h-16 w-16" />
                  <span>🔴 LISTENING NOW!</span>
                </>
              ) : (
                <>
                  <Mic className="h-16 w-16" />
                  <span>🎤 CLICK TO SPEAK</span>
                </>
              )}
            </button>
            
            {/* Giant status text */}
            <div className="mt-4 text-center">
              <div className="text-white text-xl font-bold">
                {isListening ? (
                  <span className="animate-pulse text-yellow-300">🎤 I'M LISTENING! SPEAK NOW!</span>
                ) : speechSupported && voiceEnabled ? (
                  <span>👆 Click the button above to use your voice</span>
                ) : speechSupported ? (
                  <span>Voice is disabled. Enable it in the header.</span>
                ) : (
                  <span>Voice requires Chrome, Edge, or Safari browser</span>
                )}
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "🎤 Listening... Speak now" : "Ask about nutrition, health, or food analysis..."}
                className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300 resize-none ${
                  isListening ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600' : ''
                }`}
                rows={2}
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isListening}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Browser compatibility note */}
          {!speechSupported && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
              <strong>🎤 Voice Input:</strong> For the best experience with voice features, please use Chrome, Edge, or Safari browser.
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close voice settings */}
      {showVoiceSettings && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowVoiceSettings(false)}
        />
      )}
    </div>
  );
};