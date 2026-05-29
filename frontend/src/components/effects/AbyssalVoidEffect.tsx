import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const AbyssalVoidEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';

  const colorClass = isX 
    ? 'text-purple-600 dark:text-purple-400 drop-shadow-[0_0_10px_#9333ea]'
    : 'text-violet-600 dark:text-violet-400 drop-shadow-[0_0_10px_#7c3aed]';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Swirling black hole */}
      <div className="absolute inset-[-20%] rounded-full bg-black/80 blur-[8px] animate-void-pulse mix-blend-multiply dark:mix-blend-normal" />
      <div className="absolute inset-[-10%] rounded-full bg-purple-900/40 blur-[4px] animate-void-spin" style={{ borderTop: '2px solid rgba(147,51,234,0.5)', borderBottom: '2px solid rgba(147,51,234,0.5)' }} />
      
      {/* Inward pulling particles */}
      <div className="absolute inset-[-30%] overflow-visible pointer-events-none">
        <div className="absolute w-1 h-1 bg-purple-400 rounded-full animate-void-suck-1" style={{ top: '0', left: '0' }} />
        <div className="absolute w-1 h-1 bg-violet-400 rounded-full animate-void-suck-2" style={{ top: '0', right: '0' }} />
        <div className="absolute w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-void-suck-3" style={{ bottom: '0', left: '0' }} />
        <div className="absolute w-1 h-1 bg-purple-300 rounded-full animate-void-suck-4" style={{ bottom: '0', right: '0' }} />
      </div>

      <span className={`relative z-10 font-bold text-2xl ${colorClass}`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default AbyssalVoidEffect;
