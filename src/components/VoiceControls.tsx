import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Settings } from 'lucide-react';

interface VoiceControlsProps {
  onVoiceInput?: (transcript: string) => void;
  onSpeakText?: (text: string) => void;
  className?: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  onVoiceInput,
  onSpeakText,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1,
    volume: 0.8,
    voice: ''
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech APIs
  useEffect(() => {
    // Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceInput) {
          onVoiceInput(transcript);
        }
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

    // Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        if (voices.length > 0 && !voiceSettings.voice) {
          const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.name.includes('Alex') ||
            voice.name.includes('Samantha')
          ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
          
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
  }, [onVoiceInput]);

  const startListening = () => {
    if (recognitionRef.current && speechSupported && voiceEnabled) {
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

  const speakText = (text: string) => {
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
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // Set voice
    const voices = synthRef.current.getVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceSettings.voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);

    if (onSpeakText) {
      onSpeakText(text);
    }
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

  const getAvailableVoices = () => {
    return synthRef.current?.getVoices().filter(voice => voice.lang.startsWith('en')) || [];
  };

  if (!speechSupported && !synthRef.current) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Voice input button */}
      {speechSupported && (
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!voiceEnabled}
          className={`p-2 rounded-full transition-colors ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : voiceEnabled
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      )}

      {/* Voice output controls */}
      {synthRef.current && (
        <>
          {/* Speaking control */}
          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Stop speaking"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-full transition-colors ${
                voiceEnabled 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-300 text-gray-500 hover:bg-gray-400'
              }`}
              title={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            title="Voice settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Voice Settings Panel */}
      {showSettings && synthRef.current && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50 min-w-64">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Voice Settings</h3>
          
          {/* Voice selection */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Voice</label>
            <select
              value={voiceSettings.voice}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
              className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
            >
              {getAvailableVoices().map((voice) => (
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
            onClick={() => speakText("Hello! This is a test of the voice settings.")}
            disabled={isSpeaking}
            className="w-full bg-blue-500 text-white text-xs py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isSpeaking ? 'Speaking...' : 'Test Voice'}
          </button>
        </div>
      )}

      {/* Status indicators */}
      {(isListening || isSpeaking) && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isListening && <span className="text-red-500">🎤 Listening</span>}
          {isSpeaking && <span className="text-blue-500">🔊 Speaking</span>}
        </div>
      )}
    </div>
  );
};