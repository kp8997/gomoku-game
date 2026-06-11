import React, { Suspense, lazy } from 'react';

interface SkinProps {
  symbol: 'X' | 'O';
  size?: number;
}

const CatPawSkin = lazy(() => import('./CatPawSkin'));
const KittyFaceSkin = lazy(() => import('./KittyFaceSkin'));
const BubbleTeaSkin = lazy(() => import('./BubbleTeaSkin'));
const StarCharmSkin = lazy(() => import('./StarCharmSkin'));
const HeartBowSkin = lazy(() => import('./HeartBowSkin'));
const LotusSkin = lazy(() => import('./LotusSkin'));
const MoonBunnySkin = lazy(() => import('./MoonBunnySkin'));
const SunBunnySkin = lazy(() => import('./SunBunnySkin'));
const KingGeorgeSkin = lazy(() => import('./KingGeorgeSkin'));

interface SkinRendererProps {
  skinKey: string;
  symbol: 'X' | 'O';
  size?: number;
}

const SKIN_MAP: Record<string, React.LazyExoticComponent<React.FC<SkinProps>>> = {
  CAT_PAW: CatPawSkin,
  KITTY_FACE: KittyFaceSkin,
  BUBBLE_TEA: BubbleTeaSkin,
  STAR_CHARM: StarCharmSkin,
  HEART_BOW: HeartBowSkin,
  LOTUS: LotusSkin,
  MOON_BUNNY: MoonBunnySkin,
  SUN_BUNNY: SunBunnySkin,
  KING_GEORGE: KingGeorgeSkin,
};

const SkinRenderer: React.FC<SkinRendererProps> = ({ skinKey, symbol, size = 36 }) => {
  const normalizedKey = skinKey ? skinKey.toUpperCase() : '';
  const SkinComponent = SKIN_MAP[normalizedKey];
  
  if (!SkinComponent) {
    return <span>{symbol}</span>;
  }

  return (
    <Suspense fallback={<span>{symbol}</span>}>
      <SkinComponent symbol={symbol} size={size} />
    </Suspense>
  );
};

export default SkinRenderer;
