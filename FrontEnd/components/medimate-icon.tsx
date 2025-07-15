'use client';

import React from 'react';
import { useTheme } from 'next-themes';

interface MedimateIconProps {
  className?: string;
  size?: number;
  color?: 'blue' | 'black' | 'white' | 'auto';
  rotate?: number;
}

export function MedimateIcon({ 
  className = '', 
  size = 24, 
  color = 'auto',
  rotate = 0 
}: MedimateIconProps) {
  const { theme } = useTheme();

  const getIconPath = () => {
    if (color === 'auto') {
      // Use white icon for dark theme, black icon for light theme
      return theme === 'dark' ? '/white.svg' : '/black.svg';
    }
    
    switch (color) {
      case 'blue':
        return '/blue.svg';
      case 'black':
        return '/black.svg';
      case 'white':
        return '/white.svg';
      default:
        return theme === 'dark' ? '/white.svg' : '/black.svg';
    }
  };

  return (
    <div 
      className={className} 
      style={{ 
        width: size, 
        height: size,
        transform: `rotate(${rotate}deg)`,
        transition: 'transform 0.3s ease'
      }}
    >
      <img
        src={getIconPath()}
        alt="Medimate Icon"
        width={size}
        height={size}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          transform: `rotate(${rotate}deg)`
        }}
      />
    </div>
  );
}

export default MedimateIcon; 