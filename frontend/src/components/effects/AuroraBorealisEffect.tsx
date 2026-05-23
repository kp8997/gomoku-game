import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const AuroraBorealisEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';

  // X = Green/Cyan Northern Lights, O = Violet/Pink Northern Lights
  const colorClass = isX
    ? 'text-emerald-400 dark:text-emerald-300 drop-shadow-[0_0_10px_#10b981]'
    : 'text-fuchsia-400 dark:text-fuchsia-300 drop-shadow-[0_0_10px_#d946ef]';
  
  const auroraGlow = isX
    ? 'bg-gradient-to-tr from-emerald-500/40 via-cyan-500/30 to-transparent'
    : 'bg-gradient-to-tr from-fuchsia-500/40 via-indigo-500/30 to-transparent';
  
  const dustColor = isX ? '#6ee7b7' : '#f472b6'; // emerald-300 / fuchsia-400

  // Shimmering stardust style
  const dustStyle = (size: number) => ({
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: dustColor,
    filter: `blur(0.5px) drop-shadow(0 0 3px ${dustColor})`,
  });

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-visible">
      {/* Shifting Northern Lights Aura */}
      <div
        className={`absolute inset-0 rounded-full blur-[8px] ${auroraGlow} animate-aurora-shift`}
      />

      {/* Twinkling stardust */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div
          className="absolute animate-shimmer-1"
          style={{ top: '15%', left: '20%', ...dustStyle(5) }}
        />
        <div
          className="absolute animate-shimmer-2"
          style={{ top: '10%', left: '70%', ...dustStyle(4) }}
        />
        <div
          className="absolute animate-shimmer-3"
          style={{ top: '65%', left: '80%', ...dustStyle(6) }}
        />
        <div
          className="absolute animate-shimmer-4"
          style={{ top: '75%', left: '15%', ...dustStyle(4) }}
        />
        <div
          className="absolute animate-shimmer-5"
          style={{ top: '40%', left: '85%', ...dustStyle(5) }}
        />
      </div>

      {/* Core Symbol */}
      <span className={`relative z-10 font-black ${colorClass} scale-105 transition-all duration-300 hover:scale-115`}>
        {symbol}
      </span>
    </div>
  );
};

export default AuroraBorealisEffect;
