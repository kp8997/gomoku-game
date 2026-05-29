import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const StarCharmSkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#fcd34d' : '#fda4af';
  const highlight = symbol === 'X' ? '#fef3c7' : '#fecdd3';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
         aria-label={`Star Charm ${symbol}`}>
      {/* 4-pointed sparkle star */}
      <path d="M12,1 L14,9 L22,12 L14,15 L12,23 L10,15 L2,12 L10,9 Z" 
            fill={color} stroke="#1e293b" strokeWidth="0.6" />
      {/* Inner highlight */}
      <path d="M12,6 L13,10 L17,12 L13,14 L12,18 L11,14 L7,12 L11,10 Z" 
            fill={highlight} opacity="0.6" />
    </svg>
  );
};

export default StarCharmSkin;
