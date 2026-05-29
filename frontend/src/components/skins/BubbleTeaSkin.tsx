import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const BubbleTeaSkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const cupColor = symbol === 'X' ? '#a78bfa' : '#86efac';
  const lidColor = symbol === 'X' ? '#c4b5fd' : '#bbf7d0';
  const bobaColor = symbol === 'X' ? '#7c3aed' : '#16a34a';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 4px ${cupColor}40)` }}
         aria-label={`Bubble Tea ${symbol}`}>
      {/* Dome lid */}
      <path d="M7,9 Q7,5 12,5 Q17,5 17,9 Z" fill={lidColor} stroke="#1e293b" strokeWidth="0.8" />
      {/* Cup body */}
      <path d="M7,9 L8.5,21 L15.5,21 L17,9 Z" fill={cupColor} stroke="#1e293b" strokeWidth="0.8" />
      {/* Straw */}
      <line x1="14" y1="2" x2="13" y2="12" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
      {/* Tapioca balls */}
      <circle cx="10" cy="17" r="1.3" fill={bobaColor} opacity="0.7" />
      <circle cx="13" cy="18" r="1.3" fill={bobaColor} opacity="0.7" />
      <circle cx="11.5" cy="15" r="1.3" fill={bobaColor} opacity="0.7" />
      <circle cx="14" cy="15.5" r="1" fill={bobaColor} opacity="0.5" />
    </svg>
  );
};

export default BubbleTeaSkin;
