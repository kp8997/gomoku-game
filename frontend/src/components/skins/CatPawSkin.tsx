import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const CatPawSkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#f9a8d4' : '#c4b5fd';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
         aria-label={`Cat Paw ${symbol}`}>
      {/* Main pad */}
      <ellipse cx="12" cy="16" rx="5" ry="4" fill={color} stroke="#1e293b" strokeWidth="0.8" />
      {/* Toe beans */}
      <circle cx="6.5" cy="10" r="2.5" fill={color} stroke="#1e293b" strokeWidth="0.8" opacity="0.9" />
      <circle cx="17.5" cy="10" r="2.5" fill={color} stroke="#1e293b" strokeWidth="0.8" opacity="0.9" />
      <circle cx="10" cy="7" r="2" fill={color} stroke="#1e293b" strokeWidth="0.8" opacity="0.85" />
      <circle cx="14" cy="7" r="2" fill={color} stroke="#1e293b" strokeWidth="0.8" opacity="0.85" />
    </svg>
  );
};

export default CatPawSkin;
