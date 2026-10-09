import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
  };

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Upward chevron / monogram */}
      <div
        className={`${iconSizes[size]} rounded-lg bg-primary-light flex items-center justify-center text-primary-app shadow-2xs border border-primary-app shrink-0 transition-transform hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-primary-app"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </div>

      {showText && (
        <span className={`tracking-tight text-ink ${textSizes[size]}`}>
          PlaceMate <span className="text-primary-app">AI</span>
        </span>
      )}
    </div>
  );
};
