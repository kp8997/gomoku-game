import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const NatureLeafEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';
  
  // X = Cool Vibrant Teal, O = Autumn Crimson/Rose (High Contrast)
  const colorClass = isX
    ? 'text-teal-400 dark:text-teal-300 drop-shadow-[0_0_10px_#0d9488]'
    : 'text-rose-500 dark:text-rose-400 drop-shadow-[0_0_10px_#be123c]';
  const auraColor = isX ? 'bg-teal-500/30' : 'bg-rose-500/30';

  // Leaf style with beautiful high-contrast gradients and glowing drop-shadows
  const leafStyle = (size: number, rotation: number) => ({
    width: `${size}px`,
    height: `${size * 0.55}px`,
    borderRadius: '50% 0 50% 0',
    transform: `rotate(${rotation}deg)`,
    background: isX
      ? 'linear-gradient(135deg, #2dd4bf, #0d9488)'
      : 'linear-gradient(135deg, #fb7185, #be123c)',
    filter: isX
      ? 'drop-shadow(0 0 3px rgba(45,212,191,0.6))'
      : 'drop-shadow(0 0 3px rgba(244,63,94,0.6))',
  });

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Nature aura — breathing radial glow */}
      <div
        className={`absolute inset-0 rounded-full blur-[8px] ${auraColor} animate-nature-breathe`}
      />

      {/* Dynamic drifting leaves - increased sizes and leaf count for emphasis */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div
          className="absolute animate-leaf-drift-1"
          style={{ top: '15%', left: '10%', ...leafStyle(15, 25) }}
        />
        <div
          className="absolute animate-leaf-drift-2"
          style={{ top: '5%', left: '60%', ...leafStyle(13, -20) }}
        />
        <div
          className="absolute animate-leaf-drift-3"
          style={{ top: '30%', left: '75%', ...leafStyle(16, 35) }}
        />
        <div
          className="absolute animate-leaf-drift-4"
          style={{ top: '55%', left: '5%', ...leafStyle(14, -30) }}
        />
        <div
          className="absolute animate-leaf-drift-5"
          style={{ top: '20%', left: '35%', ...leafStyle(12, 15) }}
        />
        {/* Additional leaf 6 for emphasis */}
        <div
          className="absolute animate-leaf-drift-1"
          style={{ top: '70%', left: '50%', ...leafStyle(14, 45) }}
        />
        {/* Additional leaf 7 for emphasis */}
        <div
          className="absolute animate-leaf-drift-3"
          style={{ top: '45%', left: '20%', ...leafStyle(13, -10) }}
        />
      </div>

      {/* Core symbol */}
      <span className={`relative z-10 font-black ${colorClass} scale-105 transition-all duration-300 hover:scale-115`}>
        {symbol}
      </span>
    </div>
  );
};

export default NatureLeafEffect;
