import React from 'react';

interface SigTradingIconProps {
  size?: 'small' | 'large';
  className?: string;
}

export const SigTradingIcon: React.FC<SigTradingIconProps> = ({ 
  size = 'large', 
  className = '' 
}) => {
  const isSmall = size === 'small';
  const iconSize = isSmall ? 32 : 48;
  
  return (
    <div className={`${className} ${isSmall ? 'w-8 h-8' : 'w-12 h-12'}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Background Circle */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="url(#gradient1)"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="2"
        />
        
        {/* Signal Wave Lines */}
        <path
          d="M8 24 C12 16, 20 16, 24 24 C28 32, 36 32, 40 24"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        
        {/* Trading Arrow Up */}
        <path
          d="M18 30 L24 18 L30 30"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.8"
        />
        
        {/* Center Dot */}
        <circle
          cx="24"
          cy="24"
          r="2.5"
          fill="white"
          opacity="0.9"
        />
        
        {/* Trading Indicator Dots */}
        <circle cx="15" cy="20" r="1.5" fill="rgba(34, 197, 94, 0.8)" />
        <circle cx="33" cy="28" r="1.5" fill="rgba(239, 68, 68, 0.8)" />
        
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}; 