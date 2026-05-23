import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const QuantumGlitchEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';

  const colorClass = isX 
    ? 'text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]'
    : 'text-fuchsia-400 drop-shadow-[0_0_8px_#e879f9]';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Glitch trails */}
      <span className={`absolute z-0 font-bold text-2xl ${colorClass} opacity-50 animate-glitch-trail-1`} style={{ mixBlendMode: 'screen' }}>
        {symbol}
      </span>
      <span className={`absolute z-0 font-bold text-2xl text-rose-500 opacity-50 animate-glitch-trail-2`} style={{ mixBlendMode: 'screen' }}>
        {symbol}
      </span>

      {/* Digital blocks */}
      <div className="absolute inset-[-20%] overflow-visible pointer-events-none">
        <div className="absolute w-3 h-1 bg-cyan-400/60 animate-glitch-block-1" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-2 h-2 bg-fuchsia-400/60 animate-glitch-block-2" style={{ bottom: '30%', right: '10%' }} />
        <div className="absolute w-4 h-1 bg-cyan-300/60 animate-glitch-block-3" style={{ top: '70%', left: '20%' }} />
      </div>

      <span className={`relative z-10 font-bold text-2xl animate-glitch-core ${colorClass}`}>
        {symbol}
      </span>
    </div>
  );
};

export default QuantumGlitchEffect;
