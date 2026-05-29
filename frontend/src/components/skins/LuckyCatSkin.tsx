import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const LuckyCatSkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#fbbf24' : '#fda4af';
  const cheek = symbol === 'X' ? '#fde68a' : '#fecdd3';
  const dark = '#1e293b';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
         aria-label={`Lucky Cat ${symbol}`}>
      {/* Head */}
      <circle cx="12" cy="11" r="8" fill={color} stroke={dark} strokeWidth="0.8" />
      {/* Left ear */}
      <polygon points="5,6 3,0 9,4" fill={color} stroke={dark} strokeWidth="0.7" />
      {/* Right ear */}
      <polygon points="19,6 21,0 15,4" fill={color} stroke={dark} strokeWidth="0.7" />
      {/* Eyes - happy curved */}
      <path d="M8,10 Q9,8.5 10,10" fill="none" stroke={dark} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14,10 Q15,8.5 16,10" fill="none" stroke={dark} strokeWidth="1.2" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="12" cy="12.5" rx="1" ry="0.7" fill={dark} opacity="0.5" />
      {/* Mouth */}
      <path d="M10.5,13.5 Q12,15 13.5,13.5" fill="none" stroke={dark} strokeWidth="0.6" />
      {/* Cheeks */}
      <circle cx="7" cy="13" r="1.5" fill={cheek} opacity="0.6" />
      <circle cx="17" cy="13" r="1.5" fill={cheek} opacity="0.6" />
      {/* Raised paw (right) */}
      <ellipse cx="19" cy="16" rx="2.5" ry="3" fill={color} stroke={dark} strokeWidth="0.7" />
      {/* Paw pad */}
      <circle cx="19" cy="17" r="1" fill={cheek} opacity="0.5" />
    </svg>
  );
};

export default LuckyCatSkin;
