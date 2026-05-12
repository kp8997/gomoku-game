import React from 'react';
import { History as HistoryIcon, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isJoined: boolean;
  scores: Record<string, number>;
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
  isLightMode: boolean;
  setIsLightMode: (val: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  isJoined, scores, showHistory, setShowHistory, isLightMode, setIsLightMode
}) => {
  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] z-50">
      <div className="flex items-center gap-4 flex-1">
        {isJoined && (
          <>
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
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-[var(--text-muted)] text-[10px] sm:text-xs uppercase tracking-widest font-bold">
          20x20 Arena
        </div>
        <button
          className="!bg-none !border-none !shadow-none !backdrop-blur-none p-2 flex items-center justify-center hover:bg-white/10 transition-all duration-300 rounded-full group"
          onClick={() => setIsLightMode(!isLightMode)}
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? (
            <Moon size={22} className="text-slate-400 group-hover:text-blue-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all" />
          ) : (
            <Sun size={22} className="text-yellow-400 group-hover:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)] group-hover:drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] transition-all" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
