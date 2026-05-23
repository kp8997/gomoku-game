import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const RadiantSeraphEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';

  // Distinct, high-contrast holy colors
  // X = Holy Blue/Silver, O = Holy Gold/Pink
  const colorClass = isX
    ? 'text-cyan-100 drop-shadow-[0_0_10px_#67e8f9]'
    : 'text-rose-100 drop-shadow-[0_0_10px_#fca5a5]';

  const auraColor = isX ? 'bg-cyan-100/80' : 'bg-rose-100/80';
  const glowColor = isX ? 'bg-cyan-300/30' : 'bg-yellow-300/30';
  const wingColor = isX ? 'border-cyan-100/60' : 'border-white/60';
  const feather1 = isX ? 'bg-cyan-100/70' : 'bg-white/70';
  const feather2 = isX ? 'bg-cyan-200/60' : 'bg-yellow-100/60';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Pure white/blue/gold blinding aura - reduced size */}
      <div className={`absolute inset-[10%] rounded-full ${auraColor} blur-[6px] animate-seraph-aura mix-blend-screen`} />
      
      {/* Soft border/glow - reduced size */}
      <div className={`absolute inset-[0%] rounded-full ${glowColor} blur-[10px] animate-seraph-glow`} />

      {/* Angelic wings (abstract curved shapes) - reduced size */}
      <div className="absolute inset-[-10%] overflow-visible pointer-events-none flex items-center justify-between px-[10%]">
        <div className={`w-[25%] h-[60%] border-l-2 border-t-2 ${wingColor} rounded-tl-full blur-[1px] animate-seraph-wing-left`} />
        <div className={`w-[25%] h-[60%] border-r-2 border-t-2 ${wingColor} rounded-tr-full blur-[1px] animate-seraph-wing-right`} />
      </div>

      {/* Floating feathers - reduced size */}
      <div className="absolute inset-[0%] overflow-visible pointer-events-none">
        <div className={`absolute w-1.5 h-3 ${feather1} rounded-full blur-[1px] animate-seraph-feather-1`} style={{ top: '5%', left: '25%' }} />
        <div className={`absolute w-1 h-2.5 ${feather2} rounded-full blur-[1px] animate-seraph-feather-2`} style={{ top: '20%', right: '20%' }} />
        <div className={`absolute w-1.5 h-2.5 ${feather2} rounded-full blur-[1px] animate-seraph-feather-3`} style={{ bottom: '70%', left: '35%' }} />
      </div>

      <span className={`relative z-10 font-bold text-2xl ${colorClass} animate-seraph-core`}>
        {symbol}
      </span>
    </div>
  );
};

export default RadiantSeraphEffect;
