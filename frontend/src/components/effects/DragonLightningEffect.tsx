import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const DragonLightningEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';
  const colorClass = isX ? 'text-cyan-400 dark:text-cyan-300 drop-shadow-[0_0_12px_#06b6d4]' 
                         : 'text-purple-500 dark:text-purple-400 drop-shadow-[0_0_12px_#a855f7]';
  
  const arcColor = isX ? '#22d3ee' : '#c084fc';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Scale texture / aura */}
      <div className={`absolute inset-0 rounded-md opacity-50 mix-blend-screen bg-[radial-gradient(circle,${isX?'rgba(34,211,238,0.6)':'rgba(192,132,252,0.6)'}_0%,transparent_80%)] animate-lightning-aura`}></div>
      
      {/* SVG Lightning Arcs */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none opacity-100 z-20" viewBox="0 0 100 100">
        <path d="M 10 10 L 30 50 L 10 60 L 50 100" fill="none" stroke={arcColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="miter" className="animate-arc-1" style={{ filter: `drop-shadow(0 0 5px ${arcColor})` }}/>
        <path d="M 90 10 L 60 40 L 90 60 L 40 100" fill="none" stroke={arcColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="miter" className="animate-arc-2" style={{ filter: `drop-shadow(0 0 4px ${arcColor})` }}/>
        <path d="M 0 30 L 40 50 L 10 90" fill="none" stroke={arcColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter" className="animate-arc-3" style={{ filter: `drop-shadow(0 0 4px ${arcColor})` }}/>
        <path d="M 100 40 L 70 60 L 90 90" fill="none" stroke={arcColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="miter" className="animate-arc-4" style={{ filter: `drop-shadow(0 0 6px ${arcColor})` }}/>
      </svg>
      
      {/* Core Symbol */}
      <span className={`relative z-10 font-black animate-lightning-flash ${colorClass} scale-110`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default DragonLightningEffect;
