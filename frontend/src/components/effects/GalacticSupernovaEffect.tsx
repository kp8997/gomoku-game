import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const GalacticSupernovaEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';

  // X = Cyan/Blue Supernova, O = Fuchsia/Orange Supernova
  const colorClass = isX
    ? 'text-cyan-100 drop-shadow-[0_0_15px_#22d3ee]'
    : 'text-fuchsia-100 drop-shadow-[0_0_15px_#d946ef]';

  const ring1 = isX ? 'border-cyan-400/80 shadow-[0_0_10px_#22d3ee]' : 'border-fuchsia-400/80 shadow-[0_0_10px_#d946ef]';
  const ring2 = isX ? 'border-blue-400/60 shadow-[0_0_10px_#60a5fa]' : 'border-rose-400/60 shadow-[0_0_10px_#fb7185]';
  const ring3 = isX ? 'border-teal-300/40 shadow-[0_0_8px_#5eead4]' : 'border-orange-300/40 shadow-[0_0_8px_#fdba74]';

  const starColor = isX ? 'to-cyan-300' : 'to-fuchsia-300';
  const starBgColor = isX ? 'to-blue-300' : 'to-orange-300';

  return (
    <div className="relative flex items-center justify-center w-full h-full animate-supernova-shake">
      {/* Expanding supernova rings - reduced size inset-[10%] instead of inset-0 */}
      <div className="absolute inset-[10%] flex items-center justify-center pointer-events-none">
        <div className={`absolute w-[60%] h-[60%] rounded-full border-[1.5px] ${ring1} animate-supernova-ring-1`} />
        <div className={`absolute w-[60%] h-[60%] rounded-full border-[1.5px] ${ring2} animate-supernova-ring-2`} />
        <div className={`absolute w-[60%] h-[60%] rounded-full border-[1px] ${ring3} animate-supernova-ring-3`} />
      </div>

      {/* Blinding white core - reduced size */}
      <div className="absolute inset-[0%] rounded-full bg-white/90 blur-[8px] animate-supernova-core-pulse mix-blend-screen" />
      
      {/* Shooting stars - constrained inside cell */}
      <div className="absolute inset-[0%] overflow-visible pointer-events-none">
        <div className={`absolute w-4 h-[1px] bg-gradient-to-r from-transparent to-white animate-supernova-star-1`} style={{ top: '30%', left: '20%' }} />
        <div className={`absolute w-6 h-[1.5px] bg-gradient-to-r from-transparent ${starColor} animate-supernova-star-2`} style={{ top: '70%', left: '60%' }} />
        <div className={`absolute w-3 h-[1px] bg-gradient-to-r from-transparent ${starBgColor} animate-supernova-star-3`} style={{ top: '40%', left: '30%' }} />
      </div>

      <span className={`relative z-10 font-bold text-2xl ${colorClass} animate-supernova-symbol`}>
        {symbol}
      </span>
    </div>
  );
};

export default GalacticSupernovaEffect;
