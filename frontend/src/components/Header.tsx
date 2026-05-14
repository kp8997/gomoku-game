import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Layout, LogOut } from 'lucide-react';
import TurnTimer from './TurnTimer';

interface HeaderProps {
  isJoined: boolean;
  scores: Record<string, number>;
  showDrawer: boolean;
  setShowDrawer: (val: boolean) => void;
  isLightMode: boolean;
  setIsLightMode: (val: boolean) => void;
  isMyTurn: boolean;
  leaveGame: () => void;
  username: string;
  turnStartTime: number;
  turnDuration: number;
  isGameOver: boolean;
  gameMode: 'SINGLE' | 'MULTIPLE';
  currentTurnSymbol: 'X' | 'O';
  playerCount: number;
}

const Header: React.FC<HeaderProps> = ({
  isJoined, scores, showDrawer, setShowDrawer, isLightMode, setIsLightMode, isMyTurn, leaveGame, username,
  turnStartTime, turnDuration, isGameOver, gameMode, currentTurnSymbol, playerCount
}) => {
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-2 sm:px-6 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] z-50">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {isJoined && (
          <>
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className={`group relative backdrop-blur-md border border-glass-border rounded-xl p-2 sm:p-3 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner cursor-pointer ${showDrawer ? 'bg-blue-500/20 border-blue-500/50' : 'bg-glass-bg hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Toggle Game Panel"
            >
              <Layout size={20} className={`${showDrawer ? 'text-blue-500' : 'text-content-muted'} group-hover:scale-110 transition-transform`} />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </button>

            <div className="h-6 w-px bg-glass-border mx-1 sm:mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-2 sm:gap-6">
              {gameMode === 'SINGLE' ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1 sm:gap-3 bg-black/5 dark:bg-white/5 p-1 sm:p-2 px-1.5 sm:px-3 rounded-lg sm:rounded-2xl border border-glass-border shadow-sm"
                  >
                    <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    <div className="flex items-center md:flex-row md:items-center sm:flex-col sm:items-start gap-1 md:gap-2 sm:gap-0">
                      <span className="text-[8px] sm:text-[10px] text-content-muted uppercase font-black leading-none tracking-tighter whitespace-nowrap">
                        <span className="inline lg:hidden">X</span>
                        <span className="hidden lg:inline">Player X</span>
                      </span>
                      <span className="text-xs sm:text-xl font-black leading-none text-content tabular-nums">{scores['Player X'] || 0}</span>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1 sm:gap-3 bg-black/5 dark:bg-white/5 p-1 sm:p-2 px-1.5 sm:px-3 md:px-4 rounded-lg sm:rounded-2xl border border-glass-border shadow-sm"
                  >
                    <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]"></div>
                    <div className="flex items-center md:flex-row md:items-center sm:flex-col sm:items-start gap-1 md:gap-2 sm:gap-0">
                      <span className="text-[8px] sm:text-[10px] text-content-muted uppercase font-black leading-none tracking-tighter whitespace-nowrap">
                        <span className="inline lg:hidden">O</span>
                        <span className="hidden lg:inline">Player O</span>
                      </span>
                      <span className="text-xs sm:text-xl font-black leading-none text-content tabular-nums">{scores['Player O'] || 0}</span>
                    </div>
                  </motion.div>
                </>
              ) : Object.entries(scores).length > 0 ? (
                Object.entries(scores).map(([player, score], idx) => (
                  <motion.div
                    key={player}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1 sm:gap-3 bg-black/5 dark:bg-white/5 p-1 sm:p-2 px-1.5 sm:px-3 rounded-lg sm:rounded-2xl border border-glass-border shadow-sm"
                  >
                    <div className={`w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full ${idx % 2 === 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]'}`}></div>
                    <div className="flex items-center md:flex-row md:items-center sm:flex-col sm:items-start gap-1 md:gap-2 sm:gap-0">
                      <span className="text-[8px] sm:text-[10px] text-content-muted uppercase font-black leading-none tracking-tighter whitespace-nowrap">
                        <span className="inline lg:hidden">{getInitials(player)}</span>
                        <span className="hidden lg:inline">{player}</span>
                      </span>
                      <span className="text-xs sm:text-xl font-black leading-none text-content tabular-nums">{score}</span>
                    </div>
                  </motion.div>
                ))
              ) : null}
            </div>

            {isJoined && (
              <div className="ml-2 sm:ml-4 flex items-center">
                <TurnTimer
                  startTime={turnStartTime}
                  duration={turnDuration}
                  isMyTurn={isMyTurn}
                  isPaused={isGameOver}
                  gameMode={gameMode}
                  currentTurnSymbol={currentTurnSymbol}
                  playerCount={playerCount}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {username && (
            <span className="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-widest hidden md:inline whitespace-nowrap">
              HI {username}
            </span>
          )}
          <div className="text-[var(--text-muted)] text-[10px] sm:text-xs uppercase tracking-widest font-bold hidden lg:inline">
            20x20 Arena
          </div>
        </div>
        {isJoined && (
          <button
            onClick={leaveGame}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg sm:rounded-xl transition-all border border-red-500/20 group cursor-pointer"
            title="Exit Arena"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] sm:text-xs font-black uppercase hidden sm:inline">Exit</span>
          </button>
        )}
        <button
          className="!bg-none !border-none !shadow-none !backdrop-blur-none p-1.5 sm:p-2 flex items-center justify-center hover:bg-[var(--hover-bg)] transition-all duration-300 rounded-full group cursor-pointer"
          onClick={() => setIsLightMode(!isLightMode)}
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? (
            <Moon size={20} className="text-[var(--text-color)] group-hover:text-blue-600 transition-all" />
          ) : (
            <Sun size={20} className="text-yellow-400 group-hover:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)] transition-all" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
