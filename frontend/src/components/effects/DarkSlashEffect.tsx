import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const DarkSlashEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';
  // X = cool dark purple/indigo, O = deep crimson/black
  const colorClass = isX ? 'text-indigo-950 dark:text-indigo-200 drop-shadow-[0_0_8px_#312e81]' 
                         : 'text-red-950 dark:text-red-200 drop-shadow-[0_0_8px_#7f1d1d]';
  const slashColor = isX ? 'bg-indigo-500' : 'bg-red-500';

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      {/* Dark Energy Aura */}
      <div className={`absolute inset-0 rounded-full opacity-60 blur-md animate-dark-wisp mix-blend-multiply dark:mix-blend-screen ${isX ? 'bg-indigo-800' : 'bg-red-800'}`}></div>
      
      {/* Slashes */}
      <div className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay">
        <div className={`absolute h-0.5 w-[140%] ${slashColor} top-[40%] left-[-20%] rotate-45 animate-slash-1 shadow-[0_0_4px_${isX?'#4338ca':'#dc2626'}]`}></div>
        <div className={`absolute h-0.5 w-[140%] ${slashColor} top-[60%] left-[-20%] -rotate-12 animate-slash-2 shadow-[0_0_4px_${isX?'#4338ca':'#dc2626'}]`}></div>
      </div>
      
      {/* Core Symbol */}
      <span className={`relative z-10 font-black animate-slash-reveal ${colorClass} tracking-tighter`}>
        {symbol}
      </span>
    </div>
  );
};

export default DarkSlashEffect;
