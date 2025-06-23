import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: string;
  enabled: boolean;
}

interface UseVoiceReturn {
  // Speech Recognition
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  speechSupported: boolean;
  
  // Speech Synthesis
  isSpeaking: boolean;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  synthSupported: boolean;
  
  // Settings
  voiceSettings: VoiceSettings;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
  
  // General
  voiceEnabled: boolean;
  toggleVoice: () => void;
}

export const useVoice = (
  onVoiceInput?: (transcript: string) => void,
  onSpeechStart?: () => void,
  onSpeechEnd?: () => void
): UseVoiceReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthSupported, setSynthSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1,
    volume: 0.8,
    voice: '',
    enabled: true
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onVoiceInput]);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSynthSupported(true);
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices.filter(voice => voice.lang.startsWith('en')));
        
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
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [voiceSettings.voice]);

  // Speech recognition functions
  const startListening = useCallback(() => {
    if (recognitionRef.current && speechSupported && voiceSettings.enabled) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [speechSupported, voiceSettings.enabled]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Speech synthesis functions
  const speak = useCallback((text: string) => {
    if (!synthRef.current || !voiceSettings.enabled) return;

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
      .replace(/🎯|📊|🍽️|👥|✨|🚀|💡|⭐|📧|🤖|💬|🌟/g, '') // Remove emojis
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

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onSpeechStart) onSpeechStart();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onSpeechEnd) onSpeechEnd();
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onSpeechEnd) onSpeechEnd();
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [voiceSettings, availableVoices, onSpeechStart, onSpeechEnd]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      if (onSpeechEnd) onSpeechEnd();
    }
  }, [onSpeechEnd]);

  // Settings functions
  const updateVoiceSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleVoice = useCallback(() => {
    const newEnabled = !voiceSettings.enabled;
    setVoiceSettings(prev => ({ ...prev, enabled: newEnabled }));
    
    if (!newEnabled) {
      if (isSpeaking) stopSpeaking();
      if (isListening) stopListening();
    }
  }, [voiceSettings.enabled, isSpeaking, isListening, stopSpeaking, stopListening]);

  return {
    // Speech Recognition
    isListening,
    startListening,
    stopListening,
    speechSupported,
    
    // Speech Synthesis
    isSpeaking,
    speak,
    stopSpeaking,
    synthSupported,
    
    // Settings
    voiceSettings,
    updateVoiceSettings,
    availableVoices,
    
    // General
    voiceEnabled: voiceSettings.enabled,
    toggleVoice
  };
};