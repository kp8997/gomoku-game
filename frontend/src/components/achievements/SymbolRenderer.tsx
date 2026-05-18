import React, { Suspense } from 'react';
import type { EffectType } from '../../types';

const FirePhoenixEffect = React.lazy(() => import('../effects/FirePhoenixEffect'));
const DragonLightningEffect = React.lazy(() => import('../effects/DragonLightningEffect'));
const CherryBlossomEffect = React.lazy(() => import('../effects/CherryBlossomEffect'));
const DarkSlashEffect = React.lazy(() => import('../effects/DarkSlashEffect'));

interface Props {
  symbol: string;
  effectKey?: EffectType | string;
}

export const SymbolRenderer: React.FC<Props> = ({ symbol, effectKey }) => {
  // If no effect is equipped, just render the plain text
  if (!effectKey) {
    return <span className={symbol === 'X' ? 'text-blue-500' : 'text-pink-500'}>{symbol}</span>;
  }

  // Determine which effect to render based on effectKey
  let EffectComponent;
  switch (effectKey) {
    case 'FIRE_PHOENIX':
      EffectComponent = FirePhoenixEffect;
      break;
    case 'DRAGON_LIGHTNING':
      EffectComponent = DragonLightningEffect;
      break;
    case 'CHERRY_BLOSSOM':
      EffectComponent = CherryBlossomEffect;
      break;
    case 'DARK_SLASH':
      EffectComponent = DarkSlashEffect;
      break;
    default:
      return <span className={symbol === 'X' ? 'text-blue-500' : 'text-pink-500'}>{symbol}</span>;
  }

  return (
    <Suspense fallback={<span className={symbol === 'X' ? 'text-blue-500' : 'text-pink-500'}>{symbol}</span>}>
      <EffectComponent symbol={symbol} />
    </Suspense>
  );
};
