import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const HeartFlutterEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';
  // X = green, O = yellow (per user spec)
  const colorClass = isX
    ? 'text-green-500 dark:text-green-400 drop-shadow-[0_0_6px_#22c55e]'
    : 'text-yellow-500 dark:text-yellow-400 drop-shadow-[0_0_6px_#eab308]';
  const auraColor = isX ? 'bg-green-400' : 'bg-yellow-400';
  const heartColor = isX ? '#4ade80' : '#facc15'; // green-400 / yellow-400

  // Heart SVG path scaled to a small clip
  const heartStyle = {
    clipPath: "path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')",
    background: heartColor,
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Soft aura glow behind the symbol */}
      <div
        className={`absolute inset-0 rounded-full blur-md ${auraColor} animate-heart-aura`}
      />

      {/* 5 flying heart particles */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {/* Heart particle 1 */}
        <div
          className="absolute animate-heart-float-1"
          style={{ top: '70%', left: '15%', width: '10px', height: '10px', ...heartStyle }}
        />
        {/* Heart particle 2 */}
        <div
          className="absolute animate-heart-float-2"
          style={{ top: '65%', left: '60%', width: '8px', height: '8px', ...heartStyle }}
        />
        {/* Heart particle 3 */}
        <div
          className="absolute animate-heart-float-3"
          style={{ top: '80%', left: '40%', width: '9px', height: '9px', ...heartStyle }}
        />
        {/* Heart particle 4 */}
        <div
          className="absolute animate-heart-float-4"
          style={{ top: '60%', left: '75%', width: '7px', height: '7px', ...heartStyle }}
        />
        {/* Heart particle 5 */}
        <div
          className="absolute animate-heart-float-5"
          style={{ top: '75%', left: '30%', width: '8px', height: '8px', ...heartStyle }}
        />
      </div>

      {/* Core symbol */}
      <span className={`relative z-10 font-bold ${colorClass}`}>
        {symbol}
      </span>
    </div>
  );
};

export default HeartFlutterEffect;
