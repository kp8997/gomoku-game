import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const HeartBowSkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#f9a8d4' : '#93c5fd';
  const darker = symbol === 'X' ? '#f472b6' : '#60a5fa';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
         aria-label={`Heart Bow ${symbol}`}>
      {/* Left loop */}
      <ellipse cx="8" cy="10" rx="5" ry="4" fill={color} stroke="#1e293b" strokeWidth="0.8" transform="rotate(-15 8 10)" />
      {/* Right loop */}
      <ellipse cx="16" cy="10" rx="5" ry="4" fill={color} stroke="#1e293b" strokeWidth="0.8" transform="rotate(15 16 10)" />
      {/* Center knot */}
      <circle cx="12" cy="11" r="2.5" fill={darker} stroke="#1e293b" strokeWidth="0.8" />
      {/* Left ribbon tail */}
      <path d="M10,13 Q8,18 6,21" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Right ribbon tail */}
      <path d="M14,13 Q16,18 18,21" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export default HeartBowSkin;
