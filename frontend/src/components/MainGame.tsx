import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Trophy, Hash, X as CloseIcon } from 'lucide-react';
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
    <motion.div
      layout
      className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden"
    >
      {/* Sidebar - History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            layout
            initial={{ x: -320, opacity: 0, width: 0 }}
            animate={{ x: 0, opacity: 1, width: 'auto' }}
            exit={{ x: -320, opacity: 0, width: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 w-[85vw] sm:w-80 bg-glass-bg backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/5 rounded-br-3xl flex flex-col z-[60] shadow-xl lg:relative lg:inset-auto lg:h-full lg:max-h-none lg:mb-4 lg:rounded-br-3xl"
          >
            <div className="p-6 border-b border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HistoryIcon size={20} className="text-blue-500" />
                <h2 className="font-bold text-lg text-content">Move History</h2>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-content-muted border-none bg-transparent shadow-none"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
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
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-content-muted">
                  <HistoryIcon size={48} className="mb-4" />
                  <p>No moves yet</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-glass-border bg-black/5 dark:bg-white/5 flex items-center gap-2">
              <Hash size={14} className="text-blue-500" />
              <span className="text-xs font-bold tracking-wider text-content-muted uppercase">Room: {gameId}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Board Area */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-0 relative overflow-hidden"
      >
        {/* Board Container with Scroll */}
        <motion.div
          layout
          className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar rounded-3xl bg-black/5 dark:bg-white/5 border border-glass-border shadow-inner p-4 sm:p-8"
        >
          <motion.div
            layout
            className="grid gap-0 bg-board-grid p-[1px] shadow-xl border-4 border-board-grid rounded-sm"
            style={{
              gridTemplateColumns: `repeat(${board.length}, 1fr)`,
              width: 'min-content'
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const lastMove = history.length > 0 ? history[history.length - 1] : null;
                const isLastMove = lastMove && lastMove.row === r && lastMove.col === c;

                return (
                  <div
                    key={`${r}-${c}`}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-board-cell border-[1px] border-board-grid flex items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative group"
                    onClick={() => makeMove(r, c)}
                  >
                    {/* Minimal Cell Background */}
                    <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {isLastMove && (
                      <motion.div
                        layoutId="lastMoveIndicator"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400/30 blur-sm rounded-full z-0 pointer-events-none"
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: [1, 1.8, 1],
                          opacity: [0.5, 0.8, 0.5] 
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2,
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30 
                        }}
                      />
                    )}

                    {cell && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className={`
                          flex items-center justify-center text-xl sm:text-2xl font-black z-10 select-none
                          ${cell === 'X' ? 'text-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'text-pink-600 drop-shadow-[0_0_10px_rgba(219,39,119,0.5)]'}
                        `}
                      >
                        {cell}
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        </motion.div>

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
                className="glass-card rounded-[3rem] p-10 md:p-16 text-center flex flex-col items-center gap-8 shadow-2xl max-w-lg w-full"
              >
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-yellow-500/20 flex items-center justify-center animate-bounce">
                    <Trophy size={64} className="text-yellow-400" />
                  </div>
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
      </motion.div>
    </motion.div>
  );
};

export default MainGame;
