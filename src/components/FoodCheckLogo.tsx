import React from 'react';

interface FoodCheckLogoProps {
  className?: string;
}

export const FoodCheckLogo: React.FC<FoodCheckLogoProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagon background */}
      <path d="M12 2L20.5 7v10L12 22 3.5 17V7L12 2z" fill="currentColor"/>
      
      {/* Inner molecular structure */}
      <circle cx="12" cy="8" r="1.5" fill="white"/>
      <circle cx="8" cy="12" r="1.2" fill="white"/>
      <circle cx="16" cy="12" r="1.2" fill="white"/>
      <circle cx="10" cy="16" r="1" fill="white"/>
      <circle cx="14" cy="16" r="1" fill="white"/>
      
      {/* Connecting lines */}
      <line x1="12" y1="8" x2="8" y2="12" stroke="white" strokeWidth="1.5" opacity="0.8"/>
      <line x1="12" y1="8" x2="16" y2="12" stroke="white" strokeWidth="1.5" opacity="0.8"/>
      <line x1="8" y1="12" x2="10" y2="16" stroke="white" strokeWidth="1.5" opacity="0.8"/>
      <line x1="16" y1="12" x2="14" y2="16" stroke="white" strokeWidth="1.5" opacity="0.8"/>
      <line x1="10" y1="16" x2="14" y2="16" stroke="white" strokeWidth="1.5" opacity="0.8"/>
    </svg>
  );
};