import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Trophy, Hash, X } from 'lucide-react';
import { type Move } from '../types';

interface MainGameProps {
  board: (string | null)[][];
  history: Move[];
  winner: string | null;
  gameId: string;
  showHistory: boolean;
  setShowHistory: (val: boolean) => void;
  makeMove: (r: number, c: number) => void;
  resetGame: () => void;
}

const MainGame: React.FC<MainGameProps> = ({
  board, history, winner, gameId, showHistory, setShowHistory, makeMove, resetGame
}) => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden">
      {/* Sidebar - History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            className="fixed inset-y-0 left-0 w-[85vw] sm:w-80 bg-[var(--glass-bg)] backdrop-blur-2xl border-r border-[var(--glass-border)] flex flex-col z-[60] shadow-2xl lg:relative lg:inset-auto lg:h-full lg:max-h-none"
          >
            <div className="p-6 border-b border-[var(--item-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HistoryIcon size={20} className="text-blue-500" />
                <h2 className="font-bold text-lg text-[var(--text-color)]">Move History</h2>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-muted)] border-none bg-transparent shadow-none"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {history.length > 0 ? (
                history.map((move, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--item-bg)] border border-[var(--item-border)] shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${move.symbol === 'X' ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'}`}>
                        {move.symbol}
                      </span>
                      <span className="text-[var(--text-color)] text-sm font-semibold truncate max-w-[120px]">{move.player}</span>
                    </div>
                    <span className="text-[var(--text-muted)] text-xs font-mono bg-white/5 px-2 py-1 rounded">[{move.row}, {move.col}]</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-[var(--text-muted)]">
                  <HistoryIcon size={48} className="mb-4" />
                  <p>No moves yet</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--item-border)] bg-black/5 flex items-center gap-2">
              <Hash size={14} className="text-blue-500" />
              <span className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">Room: {gameId}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Board Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-0 relative overflow-hidden">
        {/* Board Container with Scroll */}
        <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar rounded-3xl bg-black/5 border border-white/5 shadow-inner p-4 sm:p-8">
          <div 
            className="grid gap-0 bg-slate-800 p-[2px] shadow-2xl border-[6px] border-slate-700 rounded-sm"
            style={{
              gridTemplateColumns: `repeat(${board.length}, 1fr)`,
              width: 'min-content'
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className="w-9 h-9 sm:w-11 sm:h-11 bg-slate-900 border-[0.5px] border-slate-800/50 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors relative group"
                  onClick={() => makeMove(r, c)}
                >
                  {/* Grid intersection helper */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-30 pointer-events-none">
                    <div className="w-full h-[1px] bg-slate-500"></div>
                    <div className="h-full w-[1px] bg-slate-500 absolute"></div>
                  </div>

                  {cell && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={`
                        w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-xl flex items-center justify-center text-xs sm:text-base font-black z-10
                        ${cell === 'X'
                          ? 'bg-blue-600 text-white shadow-blue-900/40 ring-2 ring-blue-400/30'
                          : 'bg-pink-600 text-white shadow-pink-900/40 ring-2 ring-pink-400/30'
                        }
                      `}
                    >
                      {cell}
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Winner Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-6"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[3rem] p-10 md:p-16 text-center flex flex-col items-center gap-8 shadow-2xl max-w-lg w-full"
              >
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-yellow-500/20 flex items-center justify-center animate-bounce">
                    <Trophy size={64} className="text-yellow-400" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg"
                  >
                    CHAMPION
                  </motion.div>
                </div>
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{winner}</h2>
                  <p className="text-slate-400 text-lg font-medium">Has conquered the arena!</p>
                </div>
                <button 
                  onClick={resetGame} 
                  className="w-full py-5 text-xl font-black bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 border-none"
                >
                  PLAY AGAIN
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainGame;
