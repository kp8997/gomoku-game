import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import type { AchievementResponse, EffectType, SymbolSkinType } from '../../types';
import { BadgeCard } from './BadgeCard';
import { EffectCard } from './EffectCard';
import { SkinCard } from './SkinCard';

interface AchievementPanelProps {
  hasMoves?: boolean;
  onEffectChange?: (key: EffectType) => void;
  onSkinChange?: (key: string | null) => void;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ hasMoves, onEffectChange, onSkinChange }) => {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<AchievementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedSection, setExpandedSection] = useState<'EFFECTS' | 'SKINS' | 'WIN_RATE' | 'MATCHES' | 'WINS' | null>('EFFECTS');

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await authApi.getAchievements(token);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const handleEquip = async (effectKey: EffectType) => {
    if (hasMoves) return;
    if (!token || !data) return;
    try {
      if (effectKey) {
        await authApi.equipEffect(token, effectKey);
      } else {
        await authApi.unequipEffect(token);
      }
      // Optimistic update
      setData({ ...data, equippedEffect: effectKey });
      if (onEffectChange) {
        onEffectChange(effectKey);
      }
    } catch (err) {
      console.error('Failed to equip effect:', err);
    }
  };

  const handleSkinEquip = async (skinKey: SymbolSkinType) => {
    if (hasMoves) return;
    if (!token || !data) return;
    try {
      if (skinKey) {
        await authApi.equipSkin(token, skinKey);
      } else {
        await authApi.unequipSkin(token);
      }
      setData({ ...data, equippedSkin: skinKey });
      if (onSkinChange) {
        onSkinChange(skinKey);
      }
    } catch (err) {
      console.error('Failed to equip skin:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center text-content-muted flex flex-col items-center justify-center h-full">
        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p>Log in to track and unlock achievements!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error || 'Failed to load data'}
      </div>
    );
  }

  const toggleSection = (section: 'EFFECTS' | 'SKINS' | 'WIN_RATE' | 'MATCHES' | 'WINS') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const SectionHeader = ({ title, section, count, total }: { title: string, section: any, count?: number, total?: number }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-hover transition-all rounded-t-xl cursor-pointer ${expandedSection === section ? 'border-b border-achievement-border shadow-sm' : 'rounded-b-xl'}`}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold text-content text-base">{title}</span>
        {count !== undefined && total !== undefined && (
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {count} / {total}
          </span>
        )}
      </div>
      <div className={`p-1.5 rounded-full transition-colors ${expandedSection === section ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5 text-content-muted'}`}>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${expandedSection === section ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );

  const unlockedWinRate = data.winRateBadges.filter(b => b.unlocked).length;
  const unlockedMatch = data.matchBadges.filter(b => b.unlocked).length;
  const unlockedWin = data.winBadges.filter(b => b.unlocked).length;
  const unlockedEffects = data.effects.filter(e => e.unlocked).length;
  const unlockedSkins = data.skins ? data.skins.filter(s => s.unlocked).length : 0;

  return (
    <div className="flex flex-col gap-5 p-5 h-full overflow-y-auto custom-scrollbar pb-24 bg-background/30">

      {/* Section: Effects */}
      <div className="bg-surface rounded-xl shadow-md border border-achievement-border transition-all">
        <SectionHeader title="Symbol Effects" section="EFFECTS" count={unlockedEffects} total={data.effects.length} />
        {expandedSection === 'EFFECTS' && (
          <div className="p-5 grid grid-cols-2 gap-4">
            {/* Default None */}
            <EffectCard
              effect={{ key: null, unlocked: true, requirementLabel: '' }}
              isEquipped={!data.equippedEffect}
              onEquip={handleEquip}
              hasMoves={hasMoves}
            />
            {data.effects.map(effect => (
              <EffectCard
                key={effect.key || 'default'}
                effect={effect}
                isEquipped={data.equippedEffect === effect.key}
                onEquip={handleEquip}
                hasMoves={hasMoves}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section: Symbol Skins */}
      {data.skins && data.skins.length > 0 && (
        <div className="bg-surface rounded-xl shadow-md border border-achievement-border transition-all">
          <SectionHeader title="Symbol Skins" section="SKINS" count={unlockedSkins} total={data.skins.length} />
          {expandedSection === 'SKINS' && (
            <div className="p-5 grid grid-cols-2 gap-4">
              {/* Default None */}
              <SkinCard
                skin={{ key: null, displayName: 'Default (None)', unlocked: true, requirementLabel: '' }}
                isEquipped={!data.equippedSkin}
                onEquip={handleSkinEquip}
                hasMoves={hasMoves}
              />
              {data.skins.map(skin => (
                <SkinCard
                  key={skin.key || 'default'}
                  skin={skin}
                  isEquipped={data.equippedSkin === skin.key}
                  onEquip={handleSkinEquip}
                  hasMoves={hasMoves}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section: Win Rate */}
      <div className="bg-surface rounded-xl shadow-md border border-achievement-border transition-all">
        <SectionHeader title="Win Rate Shields" section="WIN_RATE" count={unlockedWinRate} total={data.winRateBadges.length} />
        {expandedSection === 'WIN_RATE' && (
          <div className="p-6 flex flex-wrap gap-5 justify-center bg-black/5 dark:bg-white/5 rounded-b-xl">
            {data.winRateBadges.map(badge => <BadgeCard key={badge.key} badge={badge} />)}
          </div>
        )}
      </div>

      {/* Section: Match Milestones */}
      <div className="bg-surface rounded-xl shadow-md border border-achievement-border transition-all">
        <SectionHeader title="Match Medals" section="MATCHES" count={unlockedMatch} total={data.matchBadges.length} />
        {expandedSection === 'MATCHES' && (
          <div className="p-6 flex flex-wrap gap-5 justify-center bg-black/5 dark:bg-white/5 rounded-b-xl">
            {data.matchBadges.map(badge => <BadgeCard key={badge.key} badge={badge} />)}
          </div>
        )}
      </div>

      {/* Section: Win Milestones */}
      <div className="bg-surface rounded-xl shadow-md border border-achievement-border transition-all">
        <SectionHeader title="Win Crowns" section="WINS" count={unlockedWin} total={data.winBadges.length} />
        {expandedSection === 'WINS' && (
          <div className="p-6 flex flex-wrap gap-5 justify-center bg-black/5 dark:bg-white/5 rounded-b-xl">
            {data.winBadges.map(badge => <BadgeCard key={badge.key} badge={badge} />)}
          </div>
        )}
      </div>

    </div>
  );
};
