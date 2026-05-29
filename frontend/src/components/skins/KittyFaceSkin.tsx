import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const KittyFaceSkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#fb7185' : '#6ee7b7';
  const cheek = symbol === 'X' ? '#f9a8d4' : '#a7f3d0';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
         aria-label={`Kitty Face ${symbol}`}>
      {/* Face */}
      <circle cx="12" cy="13" r="8" fill={color} stroke="#1e293b" strokeWidth="0.8" />
      {/* Left ear */}
      <polygon points="5,7 3,1 9,5" fill={color} stroke="#1e293b" strokeWidth="0.8" />
      {/* Right ear */}
      <polygon points="19,7 21,1 15,5" fill={color} stroke="#1e293b" strokeWidth="0.8" />
      {/* Inner ears */}
      <polygon points="5.5,6 4,2.5 8,5" fill={cheek} opacity="0.5" />
      <polygon points="18.5,6 20,2.5 16,5" fill={cheek} opacity="0.5" />
      {/* Closed happy eyes - curved lines */}
      <path d="M8.5,12 Q9.5,10.5 10.5,12" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M13.5,12 Q14.5,10.5 15.5,12" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="12" cy="14" rx="1" ry="0.7" fill="#1e293b" opacity="0.6" />
      {/* Mouth */}
      <path d="M10.5,15.5 Q12,17 13.5,15.5" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="3" y1="13" x2="8" y2="13.5" stroke="#1e293b" strokeWidth="0.4" opacity="0.4" />
      <line x1="3" y1="15" x2="8" y2="14.5" stroke="#1e293b" strokeWidth="0.4" opacity="0.4" />
      <line x1="21" y1="13" x2="16" y2="13.5" stroke="#1e293b" strokeWidth="0.4" opacity="0.4" />
      <line x1="21" y1="15" x2="16" y2="14.5" stroke="#1e293b" strokeWidth="0.4" opacity="0.4" />
      {/* Cheeks */}
      <circle cx="7.5" cy="15" r="1.5" fill={cheek} opacity="0.6" />
      <circle cx="16.5" cy="15" r="1.5" fill={cheek} opacity="0.6" />
    </svg>
  );
};

export default KittyFaceSkin;
