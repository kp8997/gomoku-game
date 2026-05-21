import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const NatureLeafEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';
  // X = emerald forest green, O = warm amber/earth
  const colorClass = isX
    ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_6px_#059669]'
    : 'text-amber-700 dark:text-amber-400 drop-shadow-[0_0_6px_#d97706]';
  const auraColor = isX ? 'bg-emerald-300' : 'bg-amber-300';

  // Leaf colors and shapes (organic ellipse with asymmetric border-radius)
  const leafStyle = (size: number, rotation: number) => ({
    width: `${size}px`,
    height: `${size * 0.55}px`,
    borderRadius: '50% 0 50% 0',
    transform: `rotate(${rotation}deg)`,
    background: isX
      ? 'linear-gradient(135deg, #86efac, #4ade80)'
      : 'linear-gradient(135deg, #fde68a, #f59e0b)',
  });

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Nature aura — soft scale-breathing radial glow */}
      <div
        className={`absolute inset-0 rounded-full blur-[6px] ${auraColor} animate-nature-breathe`}
      />

      {/* 5 drifting leaf particles */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div
          className="absolute animate-leaf-drift-1"
          style={{ top: '10%', left: '15%', ...leafStyle(11, 20) }}
        />
        <div
          className="absolute animate-leaf-drift-2"
          style={{ top: '5%', left: '65%', ...leafStyle(9, -15) }}
        />
        <div
          className="absolute animate-leaf-drift-3"
          style={{ top: '25%', left: '80%', ...leafStyle(12, 30) }}
        />
        <div
          className="absolute animate-leaf-drift-4"
          style={{ top: '50%', left: '5%', ...leafStyle(10, -25) }}
        />
        <div
          className="absolute animate-leaf-drift-5"
          style={{ top: '20%', left: '40%', ...leafStyle(8, 10) }}
        />
      </div>

      {/* Core symbol */}
      <span className={`relative z-10 font-bold ${colorClass}`}>
        {symbol}
      </span>
    </div>
  );
};

export default NatureLeafEffect;
