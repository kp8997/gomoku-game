import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const EtherealFrostEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';

  const colorClass = isX 
    ? 'text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]'
    : 'text-blue-300 drop-shadow-[0_0_8px_#60a5fa]';

  const auraColor = isX ? 'bg-cyan-500/30' : 'bg-blue-500/30';
  
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Cold vapor aura */}
      <div className={`absolute inset-0 rounded-full blur-[6px] animate-frost-vapor ${auraColor}`} />
      
      {/* Shattering glass / frost shards */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute w-2 h-4 border-l border-b border-cyan-200/50 animate-frost-shatter-1" style={{ top: '10%', left: '20%' }} />
        <div className="absolute w-3 h-3 border-r border-t border-blue-200/50 animate-frost-shatter-2" style={{ top: '60%', right: '15%' }} />
        <div className="absolute w-2 h-2 border-l border-t border-cyan-100/50 animate-frost-shatter-3" style={{ bottom: '15%', left: '30%' }} />
        <div className="absolute w-4 h-2 border-b border-r border-blue-100/50 animate-frost-shatter-4" style={{ bottom: '40%', right: '25%' }} />
      </div>

      <span className={`relative z-10 font-bold text-2xl ${colorClass}`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default EtherealFrostEffect;
