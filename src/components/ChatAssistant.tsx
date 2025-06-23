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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
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

  // Debug function
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
    console.log('🔍 DEBUG:', info);
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    addDebugInfo('🚀 Starting voice initialization...');
    
    // Check user agent
    addDebugInfo(`🌐 Browser: ${navigator.userAgent}`);
    
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      addDebugInfo('✅ Speech Recognition API found!');
      setSpeechSupported(true);
      
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        addDebugInfo('✅ Speech Recognition initialized successfully');

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          addDebugInfo(`🎤 Voice input received: "${transcript}"`);
          setInputMessage(prev => prev + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          addDebugInfo(`❌ Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          addDebugInfo('🎤 Speech recognition ended');
          setIsListening(false);
        };

        recognitionRef.current.onstart = () => {
          addDebugInfo('🎤 Speech recognition started');
        };
      } catch (error) {
        addDebugInfo(`❌ Error creating Speech Recognition: ${error}`);
      }
    } else {
      addDebugInfo('❌ Speech Recognition API not found');
    }

    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      addDebugInfo('✅ Speech Synthesis API found!');
      setSynthSupported(true);
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        addDebugInfo(`🔊 Found ${voices.length} voices`);
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        addDebugInfo(`🔊 Found ${englishVoices.length} English voices`);
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
            addDebugInfo(`🔊 Selected voice: ${preferredVoice.name}`);
            setVoiceSettings(prev => ({ ...prev, voice: preferredVoice.name }));
          }
        }
      };

      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    } else {
      addDebugInfo('❌ Speech Synthesis API not found');
    }

    // Check permissions
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then(result => {
        addDebugInfo(`🎤 Microphone permission: ${result.state}`);
      }).catch(error => {
        addDebugInfo(`🎤 Could not check microphone permission: ${error}`);
      });
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
    addDebugInfo('🎤 Attempting to start listening...');
    
    if (!recognitionRef.current) {
      addDebugInfo('❌ No recognition object available');
      return;
    }
    
    if (!speechSupported) {
      addDebugInfo('❌ Speech not supported');
      return;
    }
    
    if (!voiceEnabled) {
      addDebugInfo('❌ Voice not enabled');
      return;
    }

    setIsListening(true);
    try {
      addDebugInfo('🎤 Calling recognition.start()...');
      recognitionRef.current.start();
      addDebugInfo('✅ Recognition.start() called successfully');
    } catch (error) {
      addDebugInfo(`❌ Error starting speech recognition: ${error}`);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    addDebugInfo('🎤 Stopping listening...');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Text-to-speech functions
  const speakMessage = (text: string) => {
    addDebugInfo(`🔊 Attempting to speak: "${text.substring(0, 50)}..."`);
    
    if (!synthRef.current || !voiceEnabled || !synthSupported) {
      addDebugInfo('❌ Speech synthesis not available');
      return;
    }

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

    if (!cleanText) {
      addDebugInfo('❌ No clean text to speak');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // Set voice
    const selectedVoice = availableVoices.find(voice => voice.name === voiceSettings.voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      addDebugInfo(`🔊 Using voice: ${selectedVoice.name}`);
    }

    utterance.onstart = () => {
      addDebugInfo('🔊 Speech started');
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      addDebugInfo('🔊 Speech ended');
      setIsSpeaking(false);
    };
    utterance.onerror = (event) => {
      addDebugInfo(`❌ Speech error: ${event.error}`);
      setIsSpeaking(false);
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    addDebugInfo('✅ Speech synthesis started');
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      addDebugInfo('🔊 Speech stopped');
    }
  };

  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    addDebugInfo(`🔄 Voice toggled: ${newState ? 'enabled' : 'disabled'}`);
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col transition-colors duration-300">
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

        <div className="flex flex-1 overflow-hidden">
          {/* Debug Panel */}
          <div className="w-80 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔍 Voice Debug Info</h3>
            
            {/* Status Summary */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Status</h4>
              <div className="space-y-1 text-sm">
                <div className={`flex items-center space-x-2 ${speechSupported ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{speechSupported ? '✅' : '❌'}</span>
                  <span>Speech Recognition</span>
                </div>
                <div className={`flex items-center space-x-2 ${synthSupported ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{synthSupported ? '✅' : '❌'}</span>
                  <span>Speech Synthesis</span>
                </div>
                <div className={`flex items-center space-x-2 ${voiceEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                  <span>{voiceEnabled ? '✅' : '⚠️'}</span>
                  <span>Voice Enabled</span>
                </div>
                <div className={`flex items-center space-x-2 ${isListening ? 'text-blue-600' : 'text-gray-600'}`}>
                  <span>{isListening ? '🎤' : '⏸️'}</span>
                  <span>Listening</span>
                </div>
                <div className={`flex items-center space-x-2 ${isSpeaking ? 'text-purple-600' : 'text-gray-600'}`}>
                  <span>{isSpeaking ? '🔊' : '🔇'}</span>
                  <span>Speaking</span>
                </div>
              </div>
            </div>

            {/* Debug Log */}
            <div className="bg-black text-green-400 p-3 rounded-lg text-xs font-mono max-h-96 overflow-y-auto">
              <h4 className="text-white font-bold mb-2">Debug Log:</h4>
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))}
              {debugInfo.length === 0 && (
                <div className="text-gray-500">No debug info yet...</div>
              )}
            </div>

            {/* Clear Debug */}
            <button
              onClick={() => setDebugInfo([])}
              className="mt-2 w-full bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600"
            >
              Clear Debug Log
            </button>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
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
              {/* 🚨 MEGA ULTRA SIMPLE VOICE BUTTON 🚨 */}
              <div className="mb-6 text-center">
                <div 
                  className="inline-block p-6 rounded-3xl shadow-2xl border-4 mb-4"
                  style={{
                    background: isListening 
                      ? 'linear-gradient(45deg, #dc2626, #ef4444)' 
                      : speechSupported && voiceEnabled
                        ? 'linear-gradient(45deg, #059669, #10b981)'
                        : 'linear-gradient(45deg, #6b7280, #9ca3af)',
                    borderColor: isListening ? '#dc2626' : speechSupported && voiceEnabled ? '#059669' : '#6b7280'
                  }}
                >
                  <button
                    onClick={() => {
                      addDebugInfo('🔘 MEGA BUTTON CLICKED!');
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    disabled={isLoading}
                    className="bg-white rounded-full p-6 shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {isListening ? (
                        <>
                          <MicOff className="w-12 h-12 text-red-600 mb-1 animate-pulse" />
                          <span className="text-red-600 font-bold text-sm">STOP</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-12 h-12 text-green-600 mb-1" />
                          <span className="text-green-600 font-bold text-sm">TALK</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold mb-2">
                    {isListening ? (
                      <span className="text-red-600 animate-pulse">🔴 LISTENING NOW!</span>
                    ) : speechSupported && voiceEnabled ? (
                      <span className="text-green-600">🎤 CLICK TO TALK</span>
                    ) : speechSupported ? (
                      <span className="text-orange-600">⚠️ VOICE DISABLED</span>
                    ) : (
                      <span className="text-red-600">❌ SPEECH NOT SUPPORTED</span>
                    )}
                  </div>
                  
                  {speechSupported && !voiceEnabled && (
                    <button
                      onClick={toggleVoice}
                      className="bg-green-500 text-white px-4 py-2 rounded-full font-bold hover:bg-green-600 transition-colors"
                    >
                      ENABLE VOICE
                    </button>
                  )}
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