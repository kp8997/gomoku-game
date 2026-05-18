import React from 'react';
import { History as HistoryIcon, X as CloseIcon, Hash } from 'lucide-react';
import HistorySection from './HistorySection';
import { type Move } from '../types';

interface GameDrawerProps {
  setShowDrawer: (val: boolean) => void;
  history: Move[];
  gameId: string;
}

const GameDrawer: React.FC<GameDrawerProps> = ({
  setShowDrawer,
  history,
  gameId,
}) => {
  const closeDrawer = () => setShowDrawer(false);

  return (
    <div className="h-full bg-glass-bg backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/5 rounded-br-3xl flex flex-col shadow-xl overflow-hidden">
      {/* Drawer Header */}
      <div className="p-4 border-b border-glass-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <HistoryIcon size={18} className="text-blue-500" />
          </div>
          <h2 className="font-bold text-content">Game History</h2>
          {history.length > 0 && (
            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-black">
              {history.length}
            </span>
          )}
        </div>
        <button
          onClick={closeDrawer}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-content-muted border-none bg-transparent shadow-none"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      {/* Drawer Content — Move History only */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <HistorySection history={history} />
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
