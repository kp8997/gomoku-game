import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const CrystalSkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#67e8f9' : '#f9a8d4';
  const facet = symbol === 'X' ? '#a5f3fc' : '#fecdd3';
  const dark = symbol === 'X' ? '#0891b2' : '#db2777';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
         style={{ filter: `drop-shadow(0 0 10px ${color}70)` }}
         aria-label={`Crystal ${symbol}`}>
      {/* Main hexagonal gem */}
      <polygon points="12,1 20,6 20,18 12,23 4,18 4,6" fill={color} stroke="#1e293b" strokeWidth="0.8" />
      {/* Top facet */}
      <polygon points="12,1 20,6 12,9 4,6" fill={facet} opacity="0.6" />
      {/* Left facet */}
      <polygon points="4,6 12,9 12,23 4,18" fill={dark} opacity="0.15" />
      {/* Center line */}
      <line x1="12" y1="9" x2="12" y2="23" stroke="#1e293b" strokeWidth="0.3" opacity="0.3" />
      <line x1="4" y1="6" x2="12" y2="9" stroke="#1e293b" strokeWidth="0.3" opacity="0.3" />
      <line x1="20" y1="6" x2="12" y2="9" stroke="#1e293b" strokeWidth="0.3" opacity="0.3" />
      {/* Sparkle highlight */}
      <circle cx="10" cy="7" r="1" fill="white" opacity="0.5" />
    </svg>
  );
};

export default CrystalSkin;
