import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const SunBunnySkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#ef4444' : '#eab308'; // Red for X, Gold for O
  const earColor = symbol === 'X' ? '#fca5a5' : '#fef08a';
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
         aria-label={`Sun Bunny ${symbol}`}>
      
      {/* Sun rays */}
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round">
        {/* Bottom */}
        <line x1="15" y1="22" x2="15" y2="23.5" transform="rotate(0 15 15)" />
        {/* Bottom-left */}
        <line x1="15" y1="22" x2="15" y2="23.5" transform="rotate(45 15 15)" />
        {/* Left */}
        <line x1="15" y1="22" x2="15" y2="23.5" transform="rotate(90 15 15)" />
        {/* Top */}
        <line x1="15" y1="22" x2="15" y2="23.5" transform="rotate(180 15 15)" />
        {/* Top-right */}
        <line x1="15" y1="22" x2="15" y2="23.5" transform="rotate(225 15 15)" />
        {/* Right */}
        <line x1="15" y1="22" x2="15" y2="23.5" transform="rotate(270 15 15)" />
        {/* Bottom-right */}
        <line x1="15" y1="22" x2="15" y2="23.5" transform="rotate(315 15 15)" />
      </g>

      {/* Sun body (bottom right) */}
      <circle cx="15" cy="15" r="6" fill={color} stroke="#1e293b" strokeWidth="0.7" />

      {/* Left bunny ear */}
      <ellipse cx="9" cy="8" rx="1.8" ry="5" fill={earColor} stroke="#1e293b" strokeWidth="0.6" transform="rotate(-30 9 8)" />
      {/* Right bunny ear */}
      <ellipse cx="13" cy="6" rx="1.8" ry="5" fill={earColor} stroke="#1e293b" strokeWidth="0.6" transform="rotate(-5 13 6)" />
      
      {/* Inner ear detail */}
      <ellipse cx="9" cy="8" rx="0.8" ry="3" fill={color} opacity="0.5" transform="rotate(-30 9 8)" />
      <ellipse cx="13" cy="6" rx="0.8" ry="3" fill={color} opacity="0.5" transform="rotate(-5 13 6)" />
    </svg>
  );
};

export default SunBunnySkin;
