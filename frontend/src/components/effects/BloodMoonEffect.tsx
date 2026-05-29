import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const BloodMoonEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';

  const colorClass = isX 
    ? 'text-red-700 dark:text-red-600 drop-shadow-[0_0_10px_#991b1b]'
    : 'text-rose-700 dark:text-rose-600 drop-shadow-[0_0_10px_#be123c]';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Blood Moon background */}
      <div className="absolute inset-[-10%] rounded-full bg-red-950/80 blur-[2px] border border-red-900/50 shadow-[0_0_15px_rgba(153,27,27,0.8)] animate-blood-moon-pulse" />
      
      {/* Red mist/aura */}
      <div className="absolute inset-[-30%] rounded-full bg-red-600/20 blur-[12px] animate-blood-mist" />

      {/* Floating dark petals/bats */}
      <div className="absolute inset-[-40%] overflow-visible pointer-events-none">
        <div className="absolute w-2 h-1.5 bg-neutral-900 rounded-full animate-blood-bat-1" style={{ top: '80%', left: '10%' }} />
        <div className="absolute w-1.5 h-1 bg-red-950 rounded-full animate-blood-bat-2" style={{ top: '70%', right: '15%' }} />
        <div className="absolute w-2 h-1.5 bg-neutral-900 rounded-full animate-blood-bat-3" style={{ bottom: '-10%', left: '40%' }} />
      </div>

      <span className={`relative z-10 font-bold text-2xl ${colorClass}`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default BloodMoonEffect;
