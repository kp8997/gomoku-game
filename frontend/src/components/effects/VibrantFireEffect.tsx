import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
  children?: React.ReactNode;
}

const VibrantFireEffect: React.FC<Props> = ({ symbol, children }) => {
  const isX = symbol === 'X';

  // Night/Dark contrast aura
  const darkAuraClass = 'bg-neutral-950 dark:bg-black';
  const coreGlow = isX ? 'bg-orange-600/80' : 'bg-red-700/80';
  
  // Intense white-hot symbol text with blazing drop-shadow
  const textShadowGlow = isX 
    ? 'drop-shadow-[0_0_12px_rgba(234,88,12,1)] text-yellow-100'
    : 'drop-shadow-[0_0_12px_rgba(220,38,38,1)] text-orange-100';

  // SVG fire paths for realistic flames
  const flameSVG = (
    <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
      <path 
        d="M50 100 C30 80, 20 60, 40 40 C45 35, 60 45, 50 20 C45 35, 60 50, 70 70 C75 80, 60 90, 50 100 Z" 
        fill="currentColor" 
      />
    </svg>
  );

  return (
    <div className="relative flex items-center justify-center w-full h-full">

      {/* ── BACKGROUND NIGHT AURA ──────────────────────── */}
      <div className={`absolute inset-0 rounded-full blur-[10px] animate-fire-vibrant-glow ${darkAuraClass}`} />
      
      {/* ── CORE INTENSE GLOW ──────────────────────────── */}
      <div className={`absolute inset-[15%] rounded-full blur-[6px] animate-fire-dance mix-blend-screen ${coreGlow}`} />

      {/* ── REALISTIC FLAME LAYERS ─────────────────────── */}
      <div className="absolute inset-[-10%] overflow-visible pointer-events-none mix-blend-screen">
        {/* Flame 1 */}
        <div className={`absolute w-[40%] h-[70%] bottom-0 left-[20%] text-orange-500 animate-fire-flicker-1`} style={{ transformOrigin: 'bottom center' }}>
          {flameSVG}
        </div>
        {/* Flame 2 */}
        <div className={`absolute w-[35%] h-[60%] bottom-[10%] right-[20%] text-red-500 animate-fire-flicker-2`} style={{ transformOrigin: 'bottom center' }}>
          {flameSVG}
        </div>
        {/* Flame 3 (Center bright) */}
        <div className={`absolute w-[50%] h-[80%] bottom-[-5%] left-[25%] text-yellow-400 animate-fire-flicker-3`} style={{ transformOrigin: 'bottom center' }}>
          {flameSVG}
        </div>
      </div>

      {/* ── EMBER SPARKS ───────────────────────────────── */}
      <div className="absolute inset-[-20%] overflow-visible pointer-events-none">
        <div className="absolute bottom-[20%] left-[30%] w-1 h-1 bg-yellow-300 rounded-full animate-ember-1" />
        <div className="absolute bottom-[30%] left-[60%] w-1.5 h-1.5 bg-orange-400 rounded-full animate-ember-2" />
        <div className="absolute bottom-[10%] left-[45%] w-1 h-1 bg-yellow-200 rounded-full animate-ember-3" />
        <div className="absolute bottom-[25%] left-[70%] w-1 h-1 bg-orange-300 rounded-full animate-ember-4" />
        <div className="absolute bottom-[15%] left-[20%] w-1.5 h-1.5 bg-red-400 rounded-full animate-ember-5" />
      </div>

      {/* ── CORE SYMBOL ─────────────────────────────────── */}
      <span className={`relative z-10 font-bold text-2xl animate-fire-dance ${textShadowGlow}`}>
        {children || symbol}
      </span>
    </div>
  );
};

export default VibrantFireEffect;
