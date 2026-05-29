import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const CosmicNebulaEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';

  // X = Deep Nebula Pink/Purple, O = Radiant Cosmic Gold
  const colorClass = isX
    ? 'text-fuchsia-400 dark:text-fuchsia-300 drop-shadow-[0_0_10px_#d946ef]'
    : 'text-amber-300 dark:text-amber-200 drop-shadow-[0_0_10px_#eab308]';
  
  const nebulaGlow = isX 
    ? 'bg-[radial-gradient(circle,rgba(217,70,239,0.45)_0%,transparent_75%)]' 
    : 'bg-[radial-gradient(circle,rgba(234,179,8,0.45)_0%,transparent_75%)]';
  
  const starColor = isX ? '#f0abfc' : '#fef08a';

  // Twinkling Star shape (4-pointed SVG star)
  const starStyle = {
    fill: starColor,
    filter: `drop-shadow(0 0 4px ${starColor})`,
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Nebula Swirl / Aura */}
      <div
        className={`absolute inset-0 rounded-full blur-[6px] ${nebulaGlow} animate-nebula-pulse`}
      />

      {/* Twinkling star particles */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0" viewBox="0 0 100 100">
        {/* Star 1 */}
        <path
          d="M 20 20 L 22 25 L 27 27 L 22 29 L 20 34 L 18 29 L 13 27 L 18 25 Z"
          className="animate-star-twinkle-1"
          style={starStyle}
        />
        {/* Star 2 */}
        <path
          d="M 75 15 L 76.5 19 L 80.5 20.5 L 76.5 22 L 75 26 L 73.5 22 L 69.5 20.5 L 73.5 19 Z"
          className="animate-star-twinkle-2"
          style={starStyle}
        />
        {/* Star 3 */}
        <path
          d="M 85 70 L 87 75 L 92 77 L 87 79 L 85 84 L 83 79 L 78 77 L 83 75 Z"
          className="animate-star-twinkle-3"
          style={starStyle}
        />
        {/* Star 4 */}
        <path
          d="M 15 75 L 16.5 79 L 20.5 80.5 L 16.5 82 L 15 86 L 13.5 82 L 9.5 80.5 L 13.5 79 Z"
          className="animate-star-twinkle-4"
          style={starStyle}
        />
        {/* Star 5 */}
        <path
          d="M 45 10 L 46.5 14 L 50.5 15.5 L 46.5 17 L 45 21 L 43.5 17 L 39.5 15.5 L 43.5 14 Z"
          className="animate-star-twinkle-5"
          style={starStyle}
        />
      </svg>

      {/* Core Symbol */}
      <span className={`relative z-10 font-black ${colorClass} scale-105 transition-all duration-300 hover:scale-115`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default CosmicNebulaEffect;
