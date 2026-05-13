import React from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isJoined: boolean;
  scores: Record<string, number>;
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
  isLightMode: boolean;
  setIsLightMode: (val: boolean) => void;
  isMyTurn: boolean;
}

const Header: React.FC<HeaderProps> = ({
  isJoined, scores, showHistory, setShowHistory, isLightMode, setIsLightMode, isMyTurn
}) => {
  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] z-50">
      <div className="flex items-center gap-4 flex-1">
        {isJoined && (
          <>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-xl p-2 px-4 flex items-center gap-2 hover:bg-[var(--hover-bg)] transition-colors border-none shadow-none text-[var(--text-color)]"
            >
              <HistoryIcon size={18} className="text-blue-500" />
              <span className="text-sm font-bold hidden sm:inline">{showHistory ? 'Hide' : 'Show'} History</span>
            </button>

            <div className="h-6 w-px bg-[var(--glass-border)] mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-6">
              {Object.entries(scores).length > 0 ? (
                Object.entries(scores).map(([player, score], idx) => (
                  <div key={player} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${idx % 2 === 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]'}`}></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold leading-none mb-1">{player}</span>
                      <span className="text-xl font-black leading-none">{score}</span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-sm font-bold hidden md:inline">Player X</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
                    <span className="text-sm font-bold hidden md:inline">Player O</span>
                  </div>
                </>
              )}
            </div>

            {isJoined && (
              <div className="ml-8 hidden lg:flex items-center">
                {isMyTurn ? (
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30 bg-blue-500/20 text-blue-500 shadow-lg animate-pulse ring-4 ring-blue-500/10 transition-all">
                    ● Your Turn
                  </span>
                ) : (
                  <motion.span 
                    animate={{ 
                      opacity: [0.4, 1, 0.4],
                      scale: [0.98, 1, 0.98]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut"
                    }}
                    className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)] transition-all"
                  >
                    ○ Waiting for Opponent
                  </motion.span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-[var(--text-muted)] text-[10px] sm:text-xs uppercase tracking-widest font-bold">
          20x20 Arena
        </div>
        <button
          className="!bg-none !border-none !shadow-none !backdrop-blur-none p-2 flex items-center justify-center hover:bg-[var(--hover-bg)] transition-all duration-300 rounded-full group"
          onClick={() => setIsLightMode(!isLightMode)}
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? (
            <Moon size={22} className="text-[var(--text-color)] group-hover:text-blue-600 transition-all" />
          ) : (
            <Sun size={22} className="text-yellow-400 group-hover:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)] transition-all" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
