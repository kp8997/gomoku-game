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

  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] z-50">
      <div className="flex items-center gap-4 flex-1">
        {isJoined && (
          <>
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className={`group relative backdrop-blur-md border border-glass-border rounded-xl p-3 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner cursor-pointer ${showDrawer ? 'bg-blue-500/20 border-blue-500/50' : 'bg-glass-bg hover:bg-black/5 dark:hover:bg-white/5'}`}
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {username && (
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest hidden md:inline">
              HI {username}
            </span>
          )}
          <div className="text-[var(--text-muted)] text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            20x20 Arena
          </div>
        </div>
        {isJoined && (
          <button
            onClick={leaveGame}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20 group cursor-pointer"
            title="Exit Arena"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase hidden sm:inline">Exit</span>
          </button>
        )}
        <button
          className="!bg-none !border-none !shadow-none !backdrop-blur-none p-2 flex items-center justify-center hover:bg-[var(--hover-bg)] transition-all duration-300 rounded-full group cursor-pointer"
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
