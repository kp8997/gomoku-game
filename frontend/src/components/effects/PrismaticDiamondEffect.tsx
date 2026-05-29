import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const PrismaticDiamondEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';

  // X = Blue/Cyan/Emerald Prismatic, O = Pink/Purple/Orange Prismatic
  const bgGradient = isX 
    ? 'from-blue-400 via-cyan-300 to-emerald-300'
    : 'from-fuchsia-400 via-purple-300 to-orange-300';

  const textGradient = isX
    ? 'from-white via-cyan-200 to-blue-300'
    : 'from-white via-fuchsia-200 to-orange-300';
    
  const shardColor = isX ? 'border-cyan-200/40' : 'border-fuchsia-200/40';

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Prismatic refracting background - reduced size */}
      <div className={`absolute inset-[10%] rounded-sm bg-gradient-to-tr ${bgGradient} opacity-50 blur-[3px] animate-prismatic-refract mix-blend-color-dodge`} />
      
      {/* Crystal shards/facets - reduced size */}
      <div className="absolute inset-[5%] overflow-visible pointer-events-none">
        <div className={`absolute w-[100%] h-[100%] border-[1.5px] border-white/50 rotate-45 animate-prismatic-facet-1`} style={{ top: '0', left: '0' }} />
        <div className={`absolute w-[80%] h-[80%] border-[1px] ${shardColor} rotate-12 animate-prismatic-facet-2`} style={{ top: '10%', left: '10%' }} />
      </div>

      {/* Multi-colored lens flares - reduced size */}
      <div className="absolute inset-[-10%] overflow-visible pointer-events-none flex items-center justify-center animate-prismatic-flare-spin">
        <div className={`w-[120%] h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_6px_${isX ? '#22d3ee' : '#e879f9'}]`} />
        <div className={`absolute w-[1.5px] h-[120%] bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_6px_${isX ? '#3b82f6' : '#f97316'}]`} />
      </div>

      <span className={children ? `relative z-10 animate-prismatic-core flex items-center justify-center` : `relative z-10 font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-br ${textGradient} drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] animate-prismatic-core`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default PrismaticDiamondEffect;
