import React from 'react';
import './effects.css';

interface Props {
  symbol: string;
}

const VibrantFireEffect: React.FC<Props> = ({ symbol }) => {
  const isX = symbol === 'X';
  // Both X and O use orange/red fire, differentiated by their sunshine layer
  const colorClass = isX
    ? 'text-orange-500 dark:text-orange-300 drop-shadow-[0_0_8px_#f97316]'
    : 'text-red-500 dark:text-red-400 drop-shadow-[0_0_8px_#ef4444]';
  const flameColor = isX
    ? 'bg-gradient-to-t from-orange-600 to-yellow-400'
    : 'bg-gradient-to-t from-red-700 to-orange-500';

  return (
    <div className="relative flex items-center justify-center w-full h-full">

      {/* ── SUNSHINE LAYER ──────────────────────────────── */}
      {isX ? (
        // X: 2 spinning elongated rays (different speeds + directions)
        <>
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none animate-sunshine-spin"
            style={{ transformOrigin: 'center center' }}
          >
            <div
              className="absolute"
              style={{
                width: '200%',
                height: '3px',
                borderRadius: '2px',
                background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.65), transparent)',
              }}
            />
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none animate-sunshine-spin-reverse"
            style={{ transformOrigin: 'center center' }}
          >
            <div
              className="absolute"
              style={{
                width: '175%',
                height: '2px',
                borderRadius: '2px',
                background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.5), transparent)',
              }}
            />
          </div>
        </>
      ) : (
        // O: pulsing radial sunshine glow
        <div
          className="absolute inset-0 rounded-full animate-sunshine-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(245,158,11,0.2) 50%, transparent 70%)',
          }}
        />
      )}

      {/* ── VIBRANT CORE GLOW ───────────────────────────── */}
      <div
        className={`absolute inset-0 rounded-full blur-[8px] animate-fire-vibrant-glow ${isX ? 'bg-orange-500' : 'bg-red-600'}`}
      />

      {/* ── 4 FLAME PARTICLES ───────────────────────────── */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {/* Top flame */}
        <div
          className={`absolute w-2 h-3.5 rounded-t-full ${flameColor} animate-fire-flicker-1`}
          style={{ top: '-10%', left: '38%', transformOrigin: 'bottom center' }}
        />
        {/* Right flame */}
        <div
          className={`absolute w-3 h-2.5 rounded-r-full ${flameColor} animate-fire-flicker-2`}
          style={{ top: '28%', right: '-12%', transformOrigin: 'left center', transform: 'rotate(90deg)' }}
        />
        {/* Bottom-left flame */}
        <div
          className={`absolute w-2.5 h-3 rounded-t-full ${flameColor} animate-fire-flicker-3`}
          style={{ bottom: '-8%', left: '10%', transformOrigin: 'bottom center' }}
        />
        {/* Bottom-right flame */}
        <div
          className={`absolute w-2 h-2.5 rounded-t-full ${flameColor} animate-fire-flicker-4`}
          style={{ bottom: '-6%', right: '12%', transformOrigin: 'bottom center' }}
        />
      </div>

      {/* ── CORE SYMBOL ─────────────────────────────────── */}
      <span className={`relative z-10 font-bold animate-fire-dance ${colorClass}`}>
        {symbol}
      </span>
    </div>
  );
};

export default VibrantFireEffect;
