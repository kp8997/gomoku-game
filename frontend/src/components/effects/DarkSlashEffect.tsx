import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const DarkSlashEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';
  
  // Standard text color with a heavy, dark shadow
  const colorClass = isX 
    ? 'text-indigo-900 dark:text-indigo-300 drop-shadow-[0_0_6px_rgba(67,56,202,0.8)]' 
    : 'text-rose-950 dark:text-rose-400 drop-shadow-[0_0_6px_rgba(225,29,72,0.8)]';
    
  const slashColor = isX ? 'bg-indigo-600/35' : 'bg-rose-600/35';

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      {/* Deep Void Aura */}
      <div className={`absolute inset-0 rounded-full blur-[8px] opacity-50 animate-pulse ${isX ? 'bg-indigo-900' : 'bg-rose-900'}`} style={{ animationDuration: '4s' }}></div>
      
      {/* Active Animated Background Slash Marks */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className={`absolute w-[140%] h-[3px] rounded-full ${slashColor} animate-active-slash-1`} />
        <div className={`absolute w-[140%] h-[2px] rounded-full ${slashColor} animate-active-slash-2`} />
        <div className={`absolute w-[140%] h-[1.5px] rounded-full ${slashColor} animate-active-slash-3`} />
        <div className={`absolute w-[140%] h-[1px] rounded-full ${slashColor} animate-active-slash-4`} />
      </div>
      
      {/* Standard Text Symbol for Perfect Size Consistency */}
      <span className={`relative z-10 font-bold ${colorClass}`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default DarkSlashEffect;
