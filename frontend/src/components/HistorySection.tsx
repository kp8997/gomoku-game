import React from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { type Move } from '../types';

interface HistorySectionProps {
  history: Move[];
}

const HistorySection: React.FC<HistorySectionProps> = ({ history }) => {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4 space-y-2 custom-scrollbar">
      {history.length > 0 ? (
        history.map((move, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-glass-border shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${move.symbol === 'X' ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'}`}>
                {move.symbol}
              </span>
              <span className="text-content text-sm font-semibold truncate max-w-[120px]">{move.player}</span>
            </div>
            <span className="text-content-muted text-xs font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">[{move.row}, {move.col}]</span>
          </div>
        ))
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-content-muted text-center p-8">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4">
            <HistoryIcon size={32} />
          </div>
          <p className="text-sm font-medium">No moves yet</p>
        </div>
      )}
    </div>
  );
};

export default HistorySection;
