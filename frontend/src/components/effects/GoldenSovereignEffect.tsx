import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const GoldenSovereignEffect: React.FC<Props> = ({ symbol, children }) => {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Majestic god rays */}
      <div className="absolute inset-[-50%] flex items-center justify-center pointer-events-none animate-gold-rays-spin">
        <div className="w-[10px] h-[200%] bg-gradient-to-b from-transparent via-yellow-400/30 to-transparent" />
        <div className="absolute w-[10px] h-[200%] bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent rotate-45" />
        <div className="absolute w-[10px] h-[200%] bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent -rotate-45" />
        <div className="absolute w-[10px] h-[200%] bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent rotate-90" />
      </div>

      {/* Gold dust */}
      <div className="absolute inset-[-20%] overflow-visible pointer-events-none">
        <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-gold-dust-1" style={{ top: '20%', left: '20%' }} />
        <div className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full animate-gold-dust-2" style={{ top: '60%', right: '15%' }} />
        <div className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-gold-dust-3" style={{ bottom: '10%', left: '40%' }} />
        <div className="absolute w-2 h-2 bg-yellow-100 rounded-full animate-gold-dust-4" style={{ bottom: '40%', right: '30%' }} />
      </div>

      <span className="relative z-10 font-bold text-2xl text-yellow-400 drop-shadow-[0_0_12px_#facc15] animate-gold-pulse">
        {children || symbol}
      </span>
    </div>
  );
};

export default GoldenSovereignEffect;
