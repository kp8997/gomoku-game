import React from 'react';
import { X as CloseIcon, Hash, Trophy } from 'lucide-react';
import { AchievementPanel } from './achievements/AchievementPanel';
import { type Move } from '../types';

interface GameDrawerProps {
  setShowDrawer: (val: boolean) => void;
  history: Move[];
  gameId: string;
  hasMoves?: boolean;
  onEffectChange?: (key: string | null) => void;
  onSkinChange?: (key: string | null) => void;
}

const GameDrawer: React.FC<GameDrawerProps> = ({
  setShowDrawer,
  gameId,
  hasMoves,
  onEffectChange,
  onSkinChange,
}) => {
  const closeDrawer = () => setShowDrawer(false);

  return (
    <div className="h-full bg-glass-bg backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/5 rounded-br-3xl flex flex-col shadow-xl overflow-hidden">
      {/* Drawer Header */}
      <div className="p-4 border-b border-glass-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Trophy size={18} className="text-blue-500" />
            </div>
            <h2 className="font-bold text-content">Arena Panel</h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-content-muted border-none bg-transparent shadow-none"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-hidden flex flex-col bg-background/50">
        <AchievementPanel hasMoves={hasMoves} onEffectChange={onEffectChange} onSkinChange={onSkinChange} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-glass-border bg-black/5 dark:bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash size={14} className="text-blue-500" />
          <span className="text-[10px] font-bold tracking-wider text-content-muted uppercase">
            Room: {gameId}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameDrawer;

