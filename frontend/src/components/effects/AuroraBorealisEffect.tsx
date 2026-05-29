import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const AuroraBorealisEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';

  // Realistic highly saturated northern lights colors
  const colorClass = isX
    ? 'text-emerald-300 drop-shadow-[0_0_12px_#059669]'
    : 'text-fuchsia-300 drop-shadow-[0_0_12px_#c026d3]';
  
  const auroraGlow = isX
    ? 'bg-gradient-to-tr from-emerald-600/80 via-cyan-400/60 to-blue-500/30'
    : 'bg-gradient-to-tr from-fuchsia-600/80 via-purple-500/60 to-indigo-500/30';

  const beamColor = isX 
    ? 'conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.4) 10%, rgba(6,182,212,0.8) 20%, transparent 30%, transparent 50%, rgba(16,185,129,0.4) 60%, rgba(6,182,212,0.8) 70%, transparent 80%)'
    : 'conic-gradient(from 0deg, transparent 0%, rgba(217,70,239,0.4) 10%, rgba(168,85,247,0.8) 20%, transparent 30%, transparent 50%, rgba(217,70,239,0.4) 60%, rgba(168,85,247,0.8) 70%, transparent 80%)';

  const dustColor = isX ? '#34d399' : '#e879f9';

  const dustStyle = (size: number) => ({
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: dustColor,
    filter: `blur(0.5px) drop-shadow(0 0 4px ${dustColor})`,
  });

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-visible">
      {/* Dark high-contrast backdrop */}
      <div className="absolute inset-[-10%] rounded-full bg-neutral-950/40 blur-[4px]" />

      {/* Rotating Aurora Beams */}
      <div className="absolute inset-[-50%] rounded-full animate-aurora-beam-spin mix-blend-screen pointer-events-none" style={{ background: beamColor, maskImage: 'radial-gradient(circle, transparent 20%, black 70%)', WebkitMaskImage: 'radial-gradient(circle, transparent 20%, black 70%)' }} />
      <div className="absolute inset-[-40%] rounded-full animate-aurora-beam-spin-reverse mix-blend-screen pointer-events-none" style={{ background: beamColor, opacity: 0.7, maskImage: 'radial-gradient(circle, transparent 30%, black 60%)', WebkitMaskImage: 'radial-gradient(circle, transparent 30%, black 60%)' }} />

      {/* Shifting Northern Lights Aura Core */}
      <div className={`absolute inset-[10%] rounded-full blur-[10px] ${auroraGlow} animate-aurora-shift mix-blend-screen`} />

      {/* Twinkling stardust */}
      <div className="absolute inset-[-20%] overflow-visible pointer-events-none">
        <div className="absolute animate-shimmer-1" style={{ top: '10%', left: '15%', ...dustStyle(5) }} />
        <div className="absolute animate-shimmer-2" style={{ top: '5%', left: '75%', ...dustStyle(4) }} />
        <div className="absolute animate-shimmer-3" style={{ top: '75%', left: '85%', ...dustStyle(6) }} />
        <div className="absolute animate-shimmer-4" style={{ top: '85%', left: '10%', ...dustStyle(4) }} />
        <div className="absolute animate-shimmer-5" style={{ top: '45%', left: '90%', ...dustStyle(5) }} />
      </div>

      {/* Core Symbol */}
      <span className={`relative z-10 font-bold text-2xl ${colorClass} animate-aurora-symbol`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default AuroraBorealisEffect;
