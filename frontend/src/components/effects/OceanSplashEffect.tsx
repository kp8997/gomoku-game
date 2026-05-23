import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const OceanSplashEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';

  // X = Deep Sapphire/Indigo, O = Bright Cyan/Turquoise
  const colorClass = isX
    ? 'text-indigo-400 dark:text-indigo-300 drop-shadow-[0_0_10px_#4f46e5]'
    : 'text-cyan-400 dark:text-cyan-300 drop-shadow-[0_0_10px_#06b6d4]';
  const rippleColor = isX ? 'bg-indigo-500/30' : 'bg-cyan-500/30';
  const dropletColor = isX ? '#6366f1' : '#22d3ee';

  // Droplet SVG shape (organic water teardrop)
  const dropletStyle = (size: number) => ({
    width: `${size}px`,
    height: `${size * 1.4}px`,
    borderRadius: '50% 50% 50% 50% / 15% 15% 85% 85%',
    background: dropletColor,
    filter: `drop-shadow(0 0 3px ${dropletColor})`,
  });

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Dynamic Water Ripple */}
      <div
        className={`absolute inset-1 rounded-full ${rippleColor} animate-water-ripple`}
      />

      {/* Floating droplets */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div
          className="absolute animate-droplet-1"
          style={{ top: '65%', left: '25%', ...dropletStyle(7) }}
        />
        <div
          className="absolute animate-droplet-2"
          style={{ top: '60%', left: '55%', ...dropletStyle(6) }}
        />
        <div
          className="absolute animate-droplet-3"
          style={{ top: '70%', left: '40%', ...dropletStyle(8) }}
        />
        <div
          className="absolute animate-droplet-4"
          style={{ top: '55%', left: '70%', ...dropletStyle(5) }}
        />
        <div
          className="absolute animate-droplet-5"
          style={{ top: '68%', left: '15%', ...dropletStyle(6) }}
        />
      </div>

      {/* Core Symbol */}
      <span className={`relative z-10 font-black ${colorClass} scale-105 transition-all duration-300 hover:scale-115`}>
        {symbol}
      </span>
    </div>
  );
};

export default OceanSplashEffect;
