import React from 'react';

interface SigTradingIconProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const SigTradingIcon: React.FC<SigTradingIconProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

// Official platform logos for component palette
export const BinanceLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#F3BA2F"/>
    <path d="M7.5 12L12 7.5L16.5 12L12 16.5L7.5 12Z" fill="#FFFFFF"/>
    <path d="M9.5 10L12 7.5L14.5 10L12 12.5L9.5 10Z" fill="#FFFFFF"/>
  </svg>
);

export const OKXLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#000000"/>
    <path d="M8 8L16 16M16 8L8 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const UniswapLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#FF007A"/>
    <path d="M12 6L8 10L12 14L16 10L12 6Z" fill="#FFFFFF"/>
    <path d="M8 10L12 14L16 10" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const TwitterLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#1DA1F2"/>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#FFFFFF"/>
  </svg>
);

export const BitcoinLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#F7931A"/>
    <path d="M17.5 10.5C17.5 8.5 15.5 7 13 7H10V17H13C15.5 17 17.5 15.5 17.5 13.5C17.5 12.5 17 11.5 16 11C17 10.5 17.5 10.5 17.5 10.5Z" fill="#FFFFFF"/>
    <path d="M14 9H12V11H14C14.5 11 15 11.5 15 12C15 12.5 14.5 13 14 13H12V15H14C15.5 15 16.5 14 16.5 12.5C16.5 11 15.5 10 14 10V9Z" fill="#FFFFFF"/>
  </svg>
);

export const EthereumLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#627EEA"/>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFFFFF"/>
    <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SolanaLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#14F195"/>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFFFFF"/>
    <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CoinMarketLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#3861FB"/>
    <path d="M12 6L8 10L12 14L16 10L12 6Z" fill="#FFFFFF"/>
    <path d="M8 10L12 14L16 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AILogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#8B5CF6"/>
    <path d="M12 6L8 10L12 14L16 10L12 6Z" fill="#FFFFFF"/>
    <path d="M8 10L12 14L16 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
); 