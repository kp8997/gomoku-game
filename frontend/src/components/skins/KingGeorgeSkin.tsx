import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const KingGeorgeSkin: React.FC<SkinProps> = ({ symbol, size = 36 }) => {
  if (symbol === 'X') {
    // King George (Brown)
    const color = '#8B4513';
    const crownColor = '#fbbf24';
    const nose = '#5C4033';
    const cheek = '#D2B48C';
    
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" 
           style={{ filter: `drop-shadow(0 0 10px ${color}70)` }}
           aria-label={`King George X`}>
        {/* Crown */}
        <path d="M6,7 L7,3 L9.5,5.5 L12,2 L14.5,5.5 L17,3 L18,7 Z" 
              fill={crownColor} stroke="#1e293b" strokeWidth="0.6" />
        {/* Crown base band */}
        <rect x="6" y="6.5" width="12" height="1.5" rx="0.3" fill={crownColor} stroke="#1e293b" strokeWidth="0.4" />
        {/* Head */}
        <ellipse cx="12" cy="14" rx="8" ry="7.5" fill={color} stroke="#1e293b" strokeWidth="0.8" />
        {/* Small round ears */}
        <circle cx="4.5" cy="10" r="2" fill={color} stroke="#1e293b" strokeWidth="0.7" />
        <circle cx="19.5" cy="10" r="2" fill={color} stroke="#1e293b" strokeWidth="0.7" />
        {/* Confident narrowed eyes */}
        <ellipse cx="9" cy="13" rx="1.5" ry="1" fill="#1e293b" />
        <ellipse cx="15" cy="13" rx="1.5" ry="1" fill="#1e293b" />
        {/* Eye highlights */}
        <circle cx="9.5" cy="12.7" r="0.4" fill="white" opacity="0.8" />
        <circle cx="15.5" cy="12.7" r="0.4" fill="white" opacity="0.8" />
        {/* Nose/snout area */}
        <ellipse cx="12" cy="16" rx="3" ry="2" fill={cheek} opacity="0.5" />
        <ellipse cx="12" cy="15.5" rx="1.3" ry="0.8" fill={nose} />
        {/* Buck teeth */}
        <rect x="11" y="17" width="1" height="1.5" rx="0.3" fill="white" stroke="#1e293b" strokeWidth="0.3" />
        <rect x="12.2" y="17" width="1" height="1.5" rx="0.3" fill="white" stroke="#1e293b" strokeWidth="0.3" />
      </svg>
    );
  } else {
    // Pink Loopy
    const color = '#f9a8d4';
    const cheek = '#f472b6';
    const nose = '#ec4899';
    
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" 
           style={{ filter: `drop-shadow(0 0 10px ${color}70)` }}
           aria-label={`Pink Loopy O`}>
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
  }
};

export default KingGeorgeSkin;
