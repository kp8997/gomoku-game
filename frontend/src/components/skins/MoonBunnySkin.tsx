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
      
      {/* Full moon (bottom left) */}
      <circle cx="9" cy="15" r="6" fill={color} stroke="#1e293b" strokeWidth="0.7" />
      {/* Moon craters */}
      <circle cx="7" cy="13" r="1.2" fill="#1e293b" opacity="0.15" />
      <circle cx="11" cy="14" r="0.8" fill="#1e293b" opacity="0.15" />
      <circle cx="8" cy="17" r="1.5" fill="#1e293b" opacity="0.15" />
            
      {/* Bunny head (top right) */}
      <ellipse cx="13" cy="6.5" rx="3.5" ry="3" fill={earColor} stroke="#1e293b" strokeWidth="0.7" />

      {/* Left bunny ear */}
      <ellipse cx="10.5" cy="3" rx="1.2" ry="4" fill={earColor} stroke="#1e293b" strokeWidth="0.6" transform="rotate(-15 10.5 3)" />
      {/* Right bunny ear */}
      <ellipse cx="14.5" cy="3" rx="1.2" ry="4" fill={earColor} stroke="#1e293b" strokeWidth="0.6" transform="rotate(15 14.5 3)" />
      
      {/* Inner ear detail */}
      <ellipse cx="10.5" cy="3" rx="0.6" ry="2.5" fill={color} opacity="0.5" transform="rotate(-15 10.5 3)" />
      <ellipse cx="14.5" cy="3" rx="0.6" ry="2.5" fill={color} opacity="0.5" transform="rotate(15 14.5 3)" />
      
      {/* Bunny face details */}
      <circle cx="11.5" cy="6.5" r="0.5" fill="#1e293b" />
      <circle cx="14" cy="6.5" r="0.5" fill="#1e293b" />
      <path d="M12.25 7.5 Q12.75 8 13.25 7.5" fill="none" stroke="#1e293b" strokeWidth="0.5" />
    </svg>
  );
};

export default MoonBunnySkin;
