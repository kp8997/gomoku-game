import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const DragonLightningEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';
  const colorClass = isX ? 'text-cyan-400 dark:text-cyan-300 drop-shadow-[0_0_8px_#06b6d4]' 
                         : 'text-purple-500 dark:text-purple-400 drop-shadow-[0_0_8px_#a855f7]';
  
  const arcColor = isX ? '#06b6d4' : '#a855f7';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Scale texture / aura */}
      <div className={`absolute inset-0 rounded-md opacity-30 mix-blend-screen bg-[radial-gradient(circle,${isX?'rgba(6,182,212,0.4)':'rgba(168,85,247,0.4)'}_0%,transparent_70%)] animate-lightning-aura`}></div>
      
      {/* SVG Lightning Arcs (Max 5 paths) */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none opacity-80 z-20" viewBox="0 0 100 100">
        <path d="M 20 10 L 40 40 L 10 50 L 50 90" fill="none" stroke={arcColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter" className="animate-arc-1" style={{ filter: `drop-shadow(0 0 3px ${arcColor})` }}/>
        <path d="M 80 10 L 60 30 L 90 60 L 50 90" fill="none" stroke={arcColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="miter" className="animate-arc-2" style={{ filter: `drop-shadow(0 0 3px ${arcColor})` }}/>
        <path d="M 10 20 L 50 50 L 20 80" fill="none" stroke={arcColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter" className="animate-arc-3" style={{ filter: `drop-shadow(0 0 3px ${arcColor})` }}/>
      </svg>
      
      {/* Core Symbol */}
      <span className={`relative z-10 font-bold animate-lightning-flash ${colorClass}`}>
        {symbol}
      </span>
    </div>
  );
};

export default DragonLightningEffect;
