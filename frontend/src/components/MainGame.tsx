import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Trophy, Hash } from 'lucide-react';
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
    <div className="game-content flex flex-1 overflow-hidden relative">
      {/* Sidebar - History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: -50 }}
            animate={{ width: window.innerWidth <= 768 ? '85vw' : 320, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -50 }}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl w-full lg:w-80 flex flex-col h-full max-h-[85vh] lg:max-h-[600px] m-0 md:m-4 overflow-hidden relative shadow-2xl z-20"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HistoryIcon size={20} className="text-blue-400" />
                <h2 className="font-bold text-lg">History</h2>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-white/10 rounded-full bg-transparent border-none shadow-none"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {history.map((move, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${move.symbol === 'X' ? 'text-blue-400' : 'text-pink-400'}`}>
                      {move.symbol}
                    </span>
                    <span className="text-slate-300 text-sm">{move.player}</span>
                  </div>
                  <span className="text-slate-500 text-xs">[{move.row}, {move.col}]</span>
                </motion.div>
              ))}
              {history.length === 0 && <p className="text-slate-500 text-center mt-10">No moves yet</p>}
            </div>
            <div className="p-4 border-t border-white/10 text-xs text-slate-500 flex items-center gap-1">
              <Hash size={12} />
              <span>Room: {gameId}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
        <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl custom-scrollbar overflow-auto max-w-full max-h-[85vh] p-4">
          <div className="game-board">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isLastMove = history.length > 0 &&
                  history[history.length - 1].row === r &&
                  history[history.length - 1].col === c;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`cell ${isLastMove ? 'last-move' : ''}`}
                    onClick={() => makeMove(r, c)}
                  >
                    {cell === 'X' && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="stone-x">X</motion.span>
                    )}
                    {cell === 'O' && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="stone-o">O</motion.span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Winner Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
            >
              <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-[40px] p-12 text-center flex flex-col items-center gap-6 shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Trophy size={60} className="text-yellow-400" />
                </div>
                <h2 className="text-5xl font-bold text-white tracking-tighter">{winner} WINS!</h2>
                <p className="text-slate-400 text-lg">The match has been decided.</p>
                <button onClick={resetGame} className="mt-4 px-12 py-5 text-xl bg-linear-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border-none shadow-none">
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MainGame;
