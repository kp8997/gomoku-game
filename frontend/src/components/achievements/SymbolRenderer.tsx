import React, { Suspense } from 'react';
import type { EffectType } from '../../types';
import SkinRenderer from '../skins/SkinRenderer';

const FirePhoenixEffect = React.lazy(() => import('../effects/FirePhoenixEffect'));
const DragonLightningEffect = React.lazy(() => import('../effects/DragonLightningEffect'));
const HeartFlutterEffect = React.lazy(() => import('../effects/HeartFlutterEffect'));
const CherryBlossomEffect = React.lazy(() => import('../effects/CherryBlossomEffect'));
const NatureLeafEffect = React.lazy(() => import('../effects/NatureLeafEffect'));
const VibrantFireEffect = React.lazy(() => import('../effects/VibrantFireEffect'));
const OceanSplashEffect = React.lazy(() => import('../effects/OceanSplashEffect'));
const CosmicNebulaEffect = React.lazy(() => import('../effects/CosmicNebulaEffect'));
const AuroraBorealisEffect = React.lazy(() => import('../effects/AuroraBorealisEffect'));
const DarkSlashEffect = React.lazy(() => import('../effects/DarkSlashEffect'));

const EtherealFrostEffect = React.lazy(() => import('../effects/EtherealFrostEffect'));
const AbyssalVoidEffect = React.lazy(() => import('../effects/AbyssalVoidEffect'));
const GoldenSovereignEffect = React.lazy(() => import('../effects/GoldenSovereignEffect'));
const QuantumGlitchEffect = React.lazy(() => import('../effects/QuantumGlitchEffect'));
const BloodMoonEffect = React.lazy(() => import('../effects/BloodMoonEffect'));
const RadiantSeraphEffect = React.lazy(() => import('../effects/RadiantSeraphEffect'));
const PrismaticDiamondEffect = React.lazy(() => import('../effects/PrismaticDiamondEffect'));
const GalacticSupernovaEffect = React.lazy(() => import('../effects/GalacticSupernovaEffect'));

interface Props {
  symbol: string;
  effectKey?: EffectType | string;
  skinKey?: string;
}

export const SymbolRenderer: React.FC<Props> = ({ symbol, effectKey, skinKey }) => {
  // Determine the glyph: skin SVG or plain text
  const glyph = skinKey
    ? <SkinRenderer skinKey={skinKey} symbol={symbol as 'X' | 'O'} size={22} />
    : <span className={symbol === 'X' ? 'text-blue-500' : 'text-pink-500'}>{symbol}</span>;

  // If no effect is equipped, just render the glyph (skin or plain text)
  if (!effectKey) {
    return glyph;
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
    case 'HEART_FLUTTER':
      EffectComponent = HeartFlutterEffect;
      break;
    case 'CHERRY_BLOSSOM':
      EffectComponent = CherryBlossomEffect;
      break;
    case 'NATURE_LEAF':
      EffectComponent = NatureLeafEffect;
      break;
    case 'VIBRANT_FIRE':
      EffectComponent = VibrantFireEffect;
      break;
    case 'OCEAN_SPLASH':
      EffectComponent = OceanSplashEffect;
      break;
    case 'COSMIC_NEBULA':
      EffectComponent = CosmicNebulaEffect;
      break;
    case 'AURORA_BOREALIS':
      EffectComponent = AuroraBorealisEffect;
      break;
    case 'DARK_SLASH':
      EffectComponent = DarkSlashEffect;
      break;
    case 'ETHEREAL_FROST':
      EffectComponent = EtherealFrostEffect;
      break;
    case 'ABYSSAL_VOID':
      EffectComponent = AbyssalVoidEffect;
      break;
    case 'GOLDEN_SOVEREIGN':
      EffectComponent = GoldenSovereignEffect;
      break;
    case 'QUANTUM_GLITCH':
      EffectComponent = QuantumGlitchEffect;
      break;
    case 'BLOOD_MOON':
      EffectComponent = BloodMoonEffect;
      break;
    case 'RADIANT_SERAPH':
      EffectComponent = RadiantSeraphEffect;
      break;
    case 'PRISMATIC_DIAMOND':
      EffectComponent = PrismaticDiamondEffect;
      break;
    case 'GALACTIC_SUPERNOVA':
      EffectComponent = GalacticSupernovaEffect;
      break;
    default:
      return glyph;
  }

  return (
    <Suspense fallback={glyph}>
      <EffectComponent symbol={symbol}>{glyph}</EffectComponent>
    </Suspense>
  );
};
