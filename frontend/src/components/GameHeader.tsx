import React from 'react';
import { History as HistoryIcon } from 'lucide-react';

interface GameHeaderProps {
  scores: Record<string, number>;
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ scores, showHistory, setShowHistory }) => {
  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl p-2 px-4 flex items-center gap-2 hover:bg-white/10 transition-colors border-none shadow-none"
        >
          <HistoryIcon size={18} />
          <span className="text-sm font-medium hidden sm:inline">{showHistory ? 'Hide' : 'Show'} History</span>
        </button>

        <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-6">
          {Object.entries(scores).length > 0 ? (
            Object.entries(scores).map(([player, score], idx) => (
              <div key={player} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${idx % 2 === 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]'}`}></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold leading-none mb-1">{player}</span>
                  <span className="text-xl font-black leading-none">{score}</span>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <span className="text-sm font-medium hidden md:inline">Player X</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
                <span className="text-sm font-medium hidden md:inline">Player O</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-slate-400 text-sm hidden lg:block uppercase tracking-widest font-bold opacity-50">20x20 Arena</div>
    </header>
  );
};

export default GameHeader;
