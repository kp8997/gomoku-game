import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const PinkLoopySkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#f9a8d4' : '#c4b5fd';
  const cheek = symbol === 'X' ? '#f472b6' : '#a78bfa';
  const nose = symbol === 'X' ? '#ec4899' : '#8b5cf6';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 10px ${color}70)` }}
         aria-label={`Pink Loopy ${symbol}`}>
      {/* Head - round face */}
      <circle cx="12" cy="13" r="9" fill={color} stroke="#1e293b" strokeWidth="0.8" />
      {/* Left rounded ear */}
      <circle cx="5" cy="6" r="3" fill={color} stroke="#1e293b" strokeWidth="0.7" />
      <circle cx="5" cy="6" r="1.5" fill={cheek} opacity="0.3" />
      {/* Right rounded ear */}
      <circle cx="19" cy="6" r="3" fill={color} stroke="#1e293b" strokeWidth="0.7" />
      <circle cx="19" cy="6" r="1.5" fill={cheek} opacity="0.3" />
      {/* Dot eyes - cute and big */}
      <circle cx="9" cy="11.5" r="1.5" fill="#1e293b" />
      <circle cx="15" cy="11.5" r="1.5" fill="#1e293b" />
      {/* Eye highlights */}
      <circle cx="9.5" cy="11" r="0.5" fill="white" opacity="0.9" />
      <circle cx="15.5" cy="11" r="0.5" fill="white" opacity="0.9" />
      {/* Tiny nose */}
      <ellipse cx="12" cy="14" rx="1.2" ry="0.8" fill={nose} />
      {/* Sweet smile */}
      <path d="M10,16 Q12,18 14,16" fill="none" stroke="#1e293b" strokeWidth="0.7" strokeLinecap="round" />
      {/* Tiny buck tooth */}
      <rect x="11.3" y="16" width="1.4" height="1.2" rx="0.3" fill="white" stroke="#1e293b" strokeWidth="0.3" />
      {/* Rosy cheeks */}
      <circle cx="6.5" cy="15" r="2" fill={cheek} opacity="0.5" />
      <circle cx="17.5" cy="15" r="2" fill={cheek} opacity="0.5" />
    </svg>
  );
};

export default PinkLoopySkin;
