import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Layout } from 'lucide-react';

interface HeaderProps {
  isJoined: boolean;
  scores: Record<string, number>;
  showDrawer: boolean;
  setShowDrawer: (val: boolean) => void;
  isLightMode: boolean;
  setIsLightMode: (val: boolean) => void;
  isMyTurn: boolean;
}

const Header: React.FC<HeaderProps> = ({
  isJoined, scores, showDrawer, setShowDrawer, isLightMode, setIsLightMode, isMyTurn
}) => {
  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] z-50">
      <div className="flex items-center gap-4 flex-1">
        {isJoined && (
          <>
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className={`group relative backdrop-blur-md border border-glass-border rounded-xl p-3 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner ${showDrawer ? 'bg-blue-500/20 border-blue-500/50' : 'bg-glass-bg hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Toggle Game Panel"
            >
              <Layout size={22} className={`${showDrawer ? 'text-blue-500' : 'text-content-muted'} group-hover:scale-110 transition-transform`} />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </button>

            <div className="h-6 w-px bg-glass-border mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-6">
              {Object.entries(scores).length > 0 ? (
                Object.entries(scores).map(([player, score], idx) => (
                  <motion.div
                    key={player}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-2 px-3 rounded-2xl border border-glass-border shadow-sm"
                  >
                    <div className={`w-3 h-3 rounded-full ${idx % 2 === 0 ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse' : 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.6)] animate-pulse'}`}></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-content-muted uppercase font-black leading-none mb-1 tracking-tighter">{player}</span>
                      <span className="text-xl font-black leading-none text-content tabular-nums">{score}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                    <span className="text-sm font-bold hidden md:inline text-content-muted">Player X</span>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]"></div>
                    <span className="text-sm font-bold hidden md:inline text-content-muted">Player O</span>
                  </div>
                </>
              )}
            </div>

            {isJoined && (
              <div className="ml-8 hidden lg:flex items-center">
                {isMyTurn ? (
                  <motion.span
                    animate={{
                      backgroundColor: ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.4)'],
                      boxShadow: [
                        '0 0 15px rgba(59,130,246,0.5), 0 0 30px rgba(59,130,246,0.3)',
                        '0 0 30px rgba(59,130,246,0.8), 0 0 60px rgba(59,130,246,0.5)',
                        '0 0 15px rgba(59,130,246,0.5), 0 0 30px rgba(59,130,246,0.3)'
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border-2 border-blue-200 text-blue-200 bg-blue-600 shadow-2xl transition-all cursor-default filter drop-shadow-[0_0_12px_rgba(59,130,246,1)]"
                  >
                    ● Your Turn
                  </motion.span>
                ) : (
                  <motion.span
                    animate={{
                      opacity: [0.8, 1, 0.8],
                      scale: [0.98, 1.05, 0.98],
                      boxShadow: [
                        '0 0 10px rgba(245,158,11,0.3), 0 0 20px rgba(245,158,11,0.2)',
                        '0 0 25px rgba(245,158,11,0.7), 0 0 50px rgba(245,158,11,0.4)',
                        '0 0 10px rgba(245,158,11,0.3), 0 0 20px rgba(245,158,11,0.2)'
                      ]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                    className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border-2 border-amber-300 bg-amber-500/30 text-amber-300 shadow-xl transition-all cursor-default filter drop-shadow-[0_0_10px_rgba(245,158,11,1)]"
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
