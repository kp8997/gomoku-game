import React from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const LotusSkin: React.FC<SkinProps> = ({ symbol, size = 24 }) => {
  const color = symbol === 'X' ? '#f472b6' : '#fef3c7';
  const inner = symbol === 'X' ? '#fda4af' : '#fde68a';
  const center = symbol === 'X' ? '#e11d48' : '#f59e0b';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" 
         style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
         aria-label={`Lotus ${symbol}`}>
      {/* Back petals */}
      <ellipse cx="6" cy="14" rx="4" ry="7" fill={color} opacity="0.6" transform="rotate(25 6 14)" stroke="#1e293b" strokeWidth="0.5" />
      <ellipse cx="18" cy="14" rx="4" ry="7" fill={color} opacity="0.6" transform="rotate(-25 18 14)" stroke="#1e293b" strokeWidth="0.5" />
      {/* Middle petals */}
      <ellipse cx="8.5" cy="13" rx="3.5" ry="7" fill={inner} opacity="0.8" transform="rotate(12 8.5 13)" stroke="#1e293b" strokeWidth="0.5" />
      <ellipse cx="15.5" cy="13" rx="3.5" ry="7" fill={inner} opacity="0.8" transform="rotate(-12 15.5 13)" stroke="#1e293b" strokeWidth="0.5" />
      {/* Center petal */}
      <ellipse cx="12" cy="12" rx="3" ry="7.5" fill={color} stroke="#1e293b" strokeWidth="0.6" />
      {/* Center dot */}
      <circle cx="12" cy="14" r="1.5" fill={center} opacity="0.7" />
    </svg>
  );
};

export default LotusSkin;
