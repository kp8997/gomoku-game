import React from 'react';
import type { EffectType, EffectDTO } from '../../types';
import { SymbolRenderer } from './SymbolRenderer';

interface Props {
  effect: EffectDTO;
  isEquipped: boolean;
  onEquip: (key: EffectType) => void;
}

export const EffectCard: React.FC<Props> = ({ effect, isEquipped, onEquip }) => {
  const handleEquip = () => {
    if (effect.unlocked && !isEquipped) {
      onEquip(effect.key);
    }
  };

  const getEffectName = (key: string) => {
    return key.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div 
      onClick={handleEquip}
      className={`relative flex flex-col overflow-hidden rounded-xl border p-3 sm:p-4 transition-all duration-300
        ${isEquipped ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10' : 'border-content-muted/40 hover:border-blue-500/50'}
        ${!effect.unlocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
      `}
    >
      {/* Equipped Badge */}
      {isEquipped && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-sm tracking-wider">
          EQUIPPED
        </div>
      )}

      {/* Lock Overlay for whole preview area */}
      {!effect.unlocked && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
          <svg className="w-8 h-8 text-content-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-semibold text-content-muted px-2 text-center">{effect.requirementLabel}</span>
        </div>
      )}

      {/* Title */}
      <h4 className={`font-bold text-sm text-center mb-3 ${isEquipped ? 'text-blue-600 dark:text-blue-400 drop-shadow-sm' : 'text-content'}`}>
        {effect.key ? getEffectName(effect.key) : 'Default (None)'}
      </h4>

      {/* Previews */}
      <div className="flex justify-around items-center gap-2 mb-2">
        <div className="w-10 h-12 flex items-center justify-center bg-background rounded-md shadow-inner border border-content-muted/20">
          <SymbolRenderer symbol="X" effectKey={effect.key} />
        </div>
        <div className="w-10 h-12 flex items-center justify-center bg-background rounded-md shadow-inner border border-content-muted/20">
          <SymbolRenderer symbol="O" effectKey={effect.key} />
        </div>
      </div>
    </div>
  );
};
