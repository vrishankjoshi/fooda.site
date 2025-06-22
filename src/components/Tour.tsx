import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Camera, MessageCircle, Mail, Star, BarChart3, Heart, Globe, Moon, Sun, Settings, User } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ReactNode;
}

interface TourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FoodCheck! 🎉',
    description: 'Let\'s take a quick tour to show you all the amazing features that will help you make better food choices.',
    target: '.foodcheck-logo',
    position: 'bottom',
    icon: <Star className="h-6 w-6" />
  },
  {
    id: 'logo',
    title: 'FoodCheck Logo',
    description: 'This is your home base! Click here anytime to return to the main page.',
    target: '.foodcheck-logo',
    position: 'bottom',
    icon: <Star className="h-6 w-6" />
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode Toggle',
    description: 'Switch between light and dark themes for comfortable viewing at any time of day.',
    target: '.dark-mode-toggle',
    position: 'bottom',
    icon: <Moon className="h-6 w-6" />
  },
  {
    id: 'language',
    title: 'Language Selector',
    description: 'FoodCheck supports 7 languages! Choose your preferred language for the best experience.',
    target: '.language-selector',
    position: 'bottom',
    icon: <Globe className="h-6 w-6" />
  },
  {
    id: 'navigation',
    title: 'Quick Navigation',
    description: 'Access AI Analysis and Chat Assistant directly from the header for quick access.',
    target: '.main-navigation',
    position: 'bottom',
    icon: <BarChart3 className="h-6 w-6" />
  },
  {
    id: 'auth',
    title: 'User Account',
    description: 'Sign up or sign in to save your analysis history and get personalized recommendations.',
    target: '.auth-buttons',
    position: 'bottom',
    icon: <User className="h-6 w-6" />
  },
  {
    id: 'hero',
    title: 'AI-Powered Food Analysis',
    description: 'Our revolutionary AI analyzes nutrition labels to give you comprehensive health and taste insights.',
    target: '.hero-section',
    position: 'bottom',
    icon: <Heart className="h-6 w-6" />
  },
  {
    id: 'cta-button',
    title: 'Start Analysis',
    description: 'Click here to begin analyzing your food! You can upload photos or use your camera.',
    target: '.cta-button',
    position: 'top',
    icon: <Camera className="h-6 w-6" />
  },
  {
    id: 'email-section',
    title: 'Email Analysis',
    description: 'Send nutrition label photos to our email for detailed analysis. Perfect for comprehensive reports!',
    target: '.email-section',
    position: 'top',
    icon: <Mail className="h-6 w-6" />
  },
  {
    id: 'ai-vision',
    title: 'AI Vision Analysis',
    description: 'Upload photos instantly and get real-time analysis powered by advanced computer vision.',
    target: '.ai-vision-card',
    position: 'top',
    icon: <Camera className="h-6 w-6" />
  },
  {
    id: 'chat-assistant',
    title: 'AI Chat Assistant',
    description: 'Ask questions about nutrition, health conditions, and get personalized advice from our AI.',
    target: '.chat-assistant-card',
    position: 'top',
    icon: <MessageCircle className="h-6 w-6" />
  },
  {
    id: 'vish-score',
    title: 'Revolutionary Vish Score',
    description: 'Our unique scoring system that evaluates BOTH nutrition AND taste quality - the first of its kind!',
    target: '.vish-score-section',
    position: 'top',
    icon: <Star className="h-6 w-6" />
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
    description: 'Simple 3-step process: Upload → AI Analysis → Get Results. It\'s that easy!',
    target: '.how-it-works-section',
    position: 'top',
    icon: <BarChart3 className="h-6 w-6" />
  },
  {
    id: 'features',
    title: 'What Makes Us Special',
    description: 'Deep nutrition analysis, taste science, personalized warnings, and unified scoring all in one place.',
    target: '.features-section',
    position: 'top',
    icon: <Heart className="h-6 w-6" />
  }
];

export const Tour: React.FC<TourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (element) {
        setHighlightedElement(element);
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Add highlight class
        element.classList.add('tour-highlight');
      }
    }

    return () => {
      // Clean up highlight
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, isOpen, highlightedElement]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
      }
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
    }
    onClose();
  };

  const completeTour = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
    }
    onComplete();
    onClose();
  };

  const goToStep = (stepIndex: number) => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
    }
    setCurrentStep(stepIndex);
  };

  if (!isOpen || currentStep >= tourSteps.length) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 pointer-events-none" />
      
      {/* Tour Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 max-w-md w-full mx-4 transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-green-100 text-sm">Step {currentStep + 1} of {tourSteps.length}</p>
              </div>
            </div>
            <button 
              onClick={skipTour}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentStep 
                    ? 'bg-green-500 scale-125' 
                    : index < currentStep 
                      ? 'bg-green-300 dark:bg-green-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={skipTour}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Skip Tour
              </button>
              
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <span>{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
                {currentStep === tourSteps.length - 1 ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        {currentStep === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-b-2xl border-t border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              💡 <strong>Did you know?</strong> FoodCheck is the world's first platform to analyze both nutrition AND taste quality!
            </p>
          </div>
        )}
      </div>

      {/* Tour Styles */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.5);
          }
        }
      `}</style>
    </>
  );
};