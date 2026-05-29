import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const CherryBlossomEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';
  // X = soft pink/white, O = deeper crimson/rose
  const colorClass = isX ? 'text-rose-300 dark:text-rose-200 drop-shadow-[0_0_6px_#fda4af]' 
                         : 'text-red-500 dark:text-red-400 drop-shadow-[0_0_8px_#ef4444]';
  const petalColor = isX ? 'bg-rose-300' : 'bg-red-400';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Bloom glow */}
      <div className={`absolute inset-0 rounded-full opacity-40 blur-[4px] animate-bloom-pulse ${isX ? 'bg-rose-400' : 'bg-red-500'}`}></div>
      
      {/* 5 Falling Petals */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {/* Petal shapes using pure CSS clip-path or rounded corners */}
        <div className={`absolute w-2 h-1.5 rounded-[50%_0_50%_0] ${petalColor} opacity-80 animate-petal-1 top-[10%] left-[20%]`}></div>
        <div className={`absolute w-1.5 h-2 rounded-[0_50%_0_50%] ${petalColor} opacity-90 animate-petal-2 top-0 left-[60%]`}></div>
        <div className={`absolute w-2.5 h-1.5 rounded-[50%_0_50%_0] ${petalColor} opacity-70 animate-petal-3 top-[30%] left-[80%]`}></div>
        <div className={`absolute w-2 h-2 rounded-full ${petalColor} opacity-60 animate-petal-4 top-[50%] left-[10%]`}></div>
        <div className={`absolute w-1.5 h-1.5 rounded-[0_50%_0_50%] ${petalColor} opacity-80 animate-petal-5 top-[20%] left-[40%]`}></div>
      </div>
      
      {/* Core Symbol */}
      <span className={`relative z-10 font-bold ${colorClass}`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default CherryBlossomEffect;
