import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, MessageCircle, Mic, MicOff, Volume2, VolumeX, Pause, Play } from 'lucide-react';
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
        setInputMessage(transcript);
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
      synthRef.current = window.speechSynthesis;
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
      if (voiceEnabled && synthRef.current) {
        speakMessage(welcomeMessage);
      }
    }
  }, [isOpen, initialAnalysis, voiceEnabled]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech-to-text functions
  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true);
      recognitionRef.current.start();
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
    if (!synthRef.current || !voiceEnabled) return;

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
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Try to use a more natural voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.name.includes('Alex') ||
      voice.name.includes('Samantha')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
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
      if (voiceEnabled && synthRef.current) {
        speakMessage(response);
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
                <p className="text-green-100">Ask me anything about nutrition and health</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Voice toggle */}
              {synthRef.current && (
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-full transition-colors ${
                    voiceEnabled 
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30' 
                      : 'bg-gray-500 text-gray-300 hover:bg-gray-400'
                  }`}
                  title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
                >
                  {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </button>
              )}
              
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
              
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Voice status indicator */}
          {speechSupported && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-green-100">
              <Mic className="h-4 w-4" />
              <span>Voice input available</span>
              {voiceEnabled && synthRef.current && (
                <>
                  <span>•</span>
                  <Volume2 className="h-4 w-4" />
                  <span>Voice responses enabled</span>
                </>
              )}
            </div>
          )}
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
                {message.type === 'bot' && synthRef.current && voiceEnabled && (
                  <button
                    onClick={() => speakMessage(message.message)}
                    className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-1"
                    disabled={isSpeaking}
                  >
                    <Play className="h-3 w-3" />
                    <span>Speak</span>
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

        {/* Input */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask me about nutrition, health, or food analysis..."}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300 resize-none"
                rows={2}
                disabled={isLoading || isListening}
              />
              
              {/* Voice input button */}
              {speechSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-3 top-3 p-1 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  disabled={isLoading}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              )}
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
          
          {/* Voice instructions */}
          {speechSupported && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {isListening ? (
                <span className="text-red-500 font-medium">🎤 Listening... Speak now</span>
              ) : (
                <span>💡 Tip: Click the microphone to use voice input, or press Enter to send</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};