import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const FirePhoenixEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';
  const colorClass = isX ? 'text-blue-400 dark:text-blue-300 drop-shadow-[0_0_6px_#3b82f6]' 
                         : 'text-pink-500 dark:text-pink-400 drop-shadow-[0_0_6px_#ec4899]';
  const particleColor = isX ? 'bg-blue-300 shadow-[0_0_4px_#3b82f6]' : 'bg-pink-300 shadow-[0_0_4px_#ec4899]';

  return (
    <div className="relative flex items-center justify-center w-full h-full group">
      {/* Background glow / wings silhouette */}
      <div className={`absolute w-[150%] h-[150%] rounded-full opacity-20 dark:opacity-30 blur-md ${isX ? 'bg-blue-500' : 'bg-pink-500'} animate-pulse`}></div>
      
      {/* 5 Ember particles for performance limit */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className={`absolute w-1 h-1 rounded-full ${particleColor} top-[80%] left-[20%] animate-ember-1`}></div>
        <div className={`absolute w-1.5 h-1.5 rounded-full ${particleColor} top-[70%] left-[50%] animate-ember-2`}></div>
        <div className={`absolute w-1 h-1 rounded-full ${particleColor} top-[90%] left-[80%] animate-ember-3`}></div>
        <div className={`absolute w-2 h-2 rounded-full ${particleColor} top-[60%] left-[30%] opacity-70 animate-ember-4`}></div>
        <div className={`absolute w-1 h-1 rounded-full ${particleColor} top-[85%] left-[70%] opacity-80 animate-ember-5`}></div>
      </div>
      
      {/* Core Symbol */}
      <span className={`relative z-10 font-bold animate-flicker ${colorClass}`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default FirePhoenixEffect;
