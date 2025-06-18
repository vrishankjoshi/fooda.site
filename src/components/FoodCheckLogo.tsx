import React from 'react';

interface FoodCheckLogoProps {
  className?: string;
}

export const FoodCheckLogo: React.FC<FoodCheckLogoProps> = ({ className = "h-6 w-6" }) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <img 
        src="/Healthy food is better then bad, old junk food (2).png" 
        alt="FoodCheck Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};