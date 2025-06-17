import React from 'react';

interface AppleLogoProps {
  className?: string;
}

export const AppleLogo: React.FC<AppleLogoProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Apple body */}
      <path d="M18.5 12c0-3.5-2.8-6.3-6.3-6.3-1.2 0-2.3.3-3.2.9-.4-.6-1.1-1-1.8-1-1.2 0-2.2 1-2.2 2.2 0 .7.3 1.3.8 1.7C5.3 10.2 5 11.1 5 12c0 4.4 3.6 8 8 8s8-3.6 8-8z"/>
      
      {/* Apple leaf */}
      <path d="M15.5 3c-.8 0-1.5.3-2 .8.5-.3 1.1-.5 1.7-.5.8 0 1.5.3 2 .8-.5-.7-1.1-1.1-1.7-1.1z"/>
      
      {/* Apple stem */}
      <path d="M13.8 2.5c0-.3-.2-.5-.5-.5s-.5.2-.5.5v1c0 .3.2.5.5.5s.5-.2.5-.5v-1z"/>
      
      {/* Apple bite */}
      <circle cx="16" cy="10" r="1.5" fill="white"/>
    </svg>
  );
};