import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const MoonBunnySkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#c084fc' : '#fdba74';
  const earColor = symbol === 'X' ? '#e9d5ff' : '#fed7aa';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
         aria-label={`Moon Bunny ${symbol}`}>
      {/* Crescent moon */}
      <path d="M6,20 A10,10 0 1,1 18,8 A7,7 0 1,0 6,20 Z" 
            fill={color} stroke="#1e293b" strokeWidth="0.7" />
      {/* Left bunny ear */}
      <ellipse cx="10" cy="4" rx="1.8" ry="5" fill={earColor} stroke="#1e293b" strokeWidth="0.6" transform="rotate(-10 10 4)" />
      {/* Right bunny ear */}
      <ellipse cx="15" cy="3.5" rx="1.8" ry="5" fill={earColor} stroke="#1e293b" strokeWidth="0.6" transform="rotate(10 15 3.5)" />
      {/* Inner ear detail */}
      <ellipse cx="10" cy="4" rx="0.8" ry="3" fill={color} opacity="0.5" transform="rotate(-10 10 4)" />
      <ellipse cx="15" cy="3.5" rx="0.8" ry="3" fill={color} opacity="0.5" transform="rotate(10 15 3.5)" />
    </svg>
  );
};

export default MoonBunnySkin;
