import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { type Move, type ChatMessage } from '../types';
import GameDrawer from './GameDrawer';

interface MainGameProps {
  board: (string | null)[][];
  history: Move[];
  winner: string | null;
  gameId: string;
  showDrawer: boolean;
  setShowDrawer: (val: boolean) => void;
  isMyTurn: boolean;
  makeMove: (r: number, c: number) => void;
  resetGame: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (content: string) => void;
  username: string;
  winningLine: Move[];
}

const MainGame: React.FC<MainGameProps> = ({
  board, history, winner, gameId, showDrawer, setShowDrawer, isMyTurn, makeMove, resetGame,
  chatMessages, onSendMessage, username, winningLine
}) => {
  const [showWinnerPopup, setShowWinnerPopup] = React.useState(false);

  React.useEffect(() => {
    if (winner) {
      const timer = setTimeout(() => {
        setShowWinnerPopup(true);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setShowWinnerPopup(false);
    }
  }, [winner]);

  return (
    <LayoutGroup>
      <motion.div
        layout
        className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden"
      >
        {/* Sidebar Drawer - History & Chat */}
        <AnimatePresence>
          {showDrawer && (
            <motion.div
              key="game-drawer-wrapper"
              layout
              initial={{ x: -360, opacity: 0, width: 0 }}
              animate={{ x: 0, opacity: 1, width: 360 }}
              exit={{ x: -360, opacity: 0, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[85vw] sm:w-[360px] z-[60] lg:relative lg:inset-auto lg:h-full lg:max-h-none overflow-hidden"
            >
              <GameDrawer
                setShowDrawer={setShowDrawer}
                history={history}
                chatMessages={chatMessages}
                onSendMessage={onSendMessage}
                username={username}
                gameId={gameId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Board Area */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 min-h-0 relative overflow-hidden"
        >
          {/* Board Container with Scroll */}
          <motion.div
            layout
            className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar rounded-3xl bg-black/5 dark:bg-white/5 border border-glass-border shadow-inner p-4 sm:p-8"
          >
            <motion.div
              layout
              className="relative shadow-xl border-4 border-board-grid rounded-sm"
              style={{ width: 'min-content' }}
            >
              <div
                className="grid gap-0 bg-board-grid p-[1px]"
                style={{
                  gridTemplateColumns: `repeat(${board.length}, 1fr)`,
                }}
              >
              {board.map((row, r) => {
                return row.map((cell, c) => {
                  const lastMove = history.length > 0 ? history[history.length - 1] : null;
                  const isLastMove = lastMove && lastMove.row === r && lastMove.col === c;
                  const isWinningCell = winningLine.some(m => m.row === r && m.col === c);

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`
                      w-8 h-8 sm:w-10 sm:h-10 bg-board-cell border-[1px] border-board-grid flex items-center justify-center transition-colors relative group
                      ${isWinningCell ? 'z-40' : ''}
                      ${isMyTurn && !winner ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5' : 'cursor-not-allowed opacity-90'}
                    `}
                      onClick={() => isMyTurn && !winner && makeMove(r, c)}
                    >
                      {/* Minimal Cell Background */}
                      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      {isLastMove && (
                        <motion.div
                          layoutId="lastMoveIndicator"
                          className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15] blur-[1px] z-30 pointer-events-none"
                          initial={{ scale: 0 }}
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{
                            scale: { repeat: Infinity, duration: 1.5 },
                            opacity: { repeat: Infinity, duration: 1.5 },
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}

                      {isLastMove && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-blue-500/30 dark:bg-blue-500/40 z-0 pointer-events-none"
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
                });
              })}
            </div>

              {/* SVG Winning Line */}
              {winner && winningLine.length >= 5 && (
                <svg className="absolute inset-0 z-50 pointer-events-none w-full h-full overflow-visible">
                  {(() => {
                    const sortedLine = [...winningLine].sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
                    const start = sortedLine[0];
                    const end = sortedLine[sortedLine.length - 1];
                    const numRows = board.length;
                    const numCols = board[0].length;
                    const winningSymbol = winningLine[0].symbol;

                    const x1 = `${((start.col + 0.5) / numCols) * 100}%`;
                    const y1 = `${((start.row + 0.5) / numRows) * 100}%`;
                    const x2 = `${((end.col + 0.5) / numCols) * 100}%`;
                    const y2 = `${((end.row + 0.5) / numRows) * 100}%`;

                    return (
                      <motion.line
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={winningSymbol === 'X' ? '#2563eb' : '#db2677'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                          filter: `drop-shadow(0 0 10px ${winningSymbol === 'X' ? '#2563eb' : '#db2677'})`
                        }}
                      />
                    );
                  })()}
                </svg>
              )}
            </motion.div>
          </motion.div>

          {/* Winner Overlay */}
          <AnimatePresence>
            {winner && showWinnerPopup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/40 flex items-center justify-center z-[100] p-6"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="glass-card !bg-white/5 dark:!bg-slate-900/70 !backdrop-blur-md rounded-[3rem] p-10 md:p-16 text-center flex flex-col items-center gap-8 shadow-2xl max-w-lg w-full"
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
    </LayoutGroup>
  );
};

export default MainGame;
