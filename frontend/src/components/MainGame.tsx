import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { type Move, type ChatMessage } from '../types';
import GameDrawer from './GameDrawer';
import ChatBubble from './ChatBubble';
import { SymbolRenderer } from './achievements/SymbolRenderer';

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
  unreadCount: number;
  onChatOpen: () => void;
  onChatClose: () => void;
  symbolEffects?: Record<string, string>;
  symbolSkins?: Record<string, string>;
  hasMoves?: boolean;
  onEffectChange?: (key: string | null) => void;
  onSkinChange?: (key: string | null) => void;
  effectsEnabled?: boolean;
  mySymbol?: string | null;
}

const MainGame: React.FC<MainGameProps> = ({
  board, history, winner, gameId, showDrawer, setShowDrawer, isMyTurn, makeMove, resetGame,
  chatMessages, onSendMessage, username, winningLine, unreadCount, onChatOpen, onChatClose, symbolEffects,
  symbolSkins, hasMoves, onEffectChange, onSkinChange, effectsEnabled = true, mySymbol = null
}) => {
  const [showWinnerPopup, setShowWinnerPopup] = React.useState(false);

  React.useEffect(() => {
    if (winner) {
      const delay = winningLine && winningLine.length > 0 ? 2500 : 0;
      if (delay === 0) {
        setShowWinnerPopup(true);
      } else {
        const timer = setTimeout(() => {
          setShowWinnerPopup(true);
        }, delay);
        return () => clearTimeout(timer);
      }
    } else {
      setShowWinnerPopup(false);
    }
  }, [winner, winningLine]);

  return (
    <LayoutGroup>
      <motion.div
        layout
        className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden"
      >
        {/* Sidebar Drawer - History only */}
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
                gameId={gameId}
                hasMoves={hasMoves}
                onEffectChange={onEffectChange}
                onSkinChange={onSkinChange}
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

                        {cell && (() => {
                          const move = history.find(m => m.row === r && m.col === c);
                          // Determine if it is our own cell using highly robust name-matching and symbol-matching fallback
                          const isOwnCell = move?.player 
                            ? move.player.toLowerCase() === username.toLowerCase()
                            : (mySymbol ? cell.toUpperCase() === mySymbol.toUpperCase() : false);
                          
                          // Resolve player key case-insensitively or fall back to own username if own cell
                          const playerKey = move?.player || (isOwnCell ? username : undefined);

                          // Resolve effect key case-insensitively
                          const effectKey = (isOwnCell && !effectsEnabled)
                            ? undefined
                            : (playerKey 
                                ? (symbolEffects?.[playerKey] || symbolEffects?.[playerKey.toLowerCase()] || symbolEffects?.[playerKey.toUpperCase()]) 
                                : undefined);

                          // Resolve skin key case-insensitively
                          const skinKey = playerKey 
                            ? (symbolSkins?.[playerKey] || symbolSkins?.[playerKey.toLowerCase()] || symbolSkins?.[playerKey.toUpperCase()]) 
                            : undefined;

                          return (
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center justify-center text-xl sm:text-2xl font-black z-10 select-none w-full h-full"
                            >
                              <SymbolRenderer symbol={cell} effectKey={effectKey} skinKey={skinKey} />
                            </motion.div>
                          );
                        })()}
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

                    const matchingMove = history.find(m => m.row === start.row && m.col === start.col);
                    const winningPlayer = matchingMove?.player || winner;
                    const winningEffect = winningPlayer ? symbolEffects?.[winningPlayer] : undefined;
                    const winningSkin = winningPlayer ? symbolSkins?.[winningPlayer] : undefined;
                    const isX = winningSymbol === 'X';

                    let baseColor = isX ? '#2563eb' : '#db2677';
                    
                    if (winningSkin && (!winningEffect || winningEffect === 'NONE')) {
                       switch (winningSkin) {
                         case 'CAT_PAW': baseColor = isX ? '#fca5a5' : '#c4b5fd'; break;
                         case 'KITTY_FACE': baseColor = isX ? '#fdba74' : '#9ca3af'; break;
                         case 'BUBBLE_TEA': baseColor = isX ? '#d4d4d8' : '#fcd34d'; break;
                         case 'STAR_CHARM': baseColor = isX ? '#fde047' : '#f472b6'; break;
                         case 'HEART_BOW': baseColor = isX ? '#ef4444' : '#ec4899'; break;
                         case 'LOTUS': baseColor = isX ? '#fbcfe8' : '#86efac'; break;
                         case 'MOON_BUNNY': baseColor = isX ? '#fef08a' : '#cbd5e1'; break;
                         case 'LUCKY_CAT': baseColor = isX ? '#f87171' : '#fbbf24'; break;
                         case 'KING_GEORGE': baseColor = isX ? '#facc15' : '#f472b6'; break;
                       }
                    }

                    const defaultLine = (
                      <motion.line
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={baseColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ filter: `drop-shadow(0 0 10px ${baseColor})` }}
                      />
                    );

                    if (!winningEffect || winningEffect === 'NONE') return defaultLine;

                    switch (winningEffect) {
                       case 'FIRE_PHOENIX': {
                         const isX = winningSymbol === 'X';
                         const baseColor = isX ? '#1e3a8a' : '#831843'; // dark blue / dark pink
                         const mainColor = isX ? '#3b82f6' : '#ec4899'; // blue / pink
                         const highlightColor = isX ? '#93c5fd' : '#fbcfe8'; // light blue / light pink
                         return (
                           <g>
                             <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={baseColor} strokeWidth="16" strokeLinecap="round" style={{ filter: 'blur(4px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }} transition={{ duration: 0.8 }} />
                             <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={mainColor} strokeWidth="8" strokeLinecap="round" className="animate-pulse" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8 }} style={{ filter: `drop-shadow(0 0 10px ${mainColor})` }} />
                             <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={highlightColor} strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8 }} />
                           </g>
                         );
                       }
                       case 'DRAGON_LIGHTNING': {
                         const isX = winningSymbol === 'X';
                         const baseColor = isX ? '#06b6d4' : '#9333ea'; // cyan / purple
                         const mainColor = isX ? '#67e8f9' : '#d8b4fe'; // light cyan / light purple
                         return (
                           <g className="animate-lightning-flash">
                             <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={baseColor} strokeWidth="24" strokeLinecap="round" style={{ filter: 'blur(8px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 0.25 }} />
                             <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={mainColor} strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.25 }} style={{ filter: `drop-shadow(0 0 16px ${mainColor})` }} />
                             <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.25 }} style={{ filter: `drop-shadow(0 0 8px #ffffff)` }} />
                           </g>
                         );
                       }
                       case 'CHERRY_BLOSSOM': {
                         const isX = winningSymbol === 'X';
                         const baseColor = isX ? '#fbcfe8' : '#f87171'; // soft pink / rose-crimson
                         const mainColor = isX ? '#f472b6' : '#dc2626'; // vibrant pink / crimson red
                         return (
                           <g>
                             <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={baseColor} strokeWidth="16" strokeLinecap="round" style={{ filter: 'blur(3px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.4 }} transition={{ duration: 1.2 }} />
                             <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={mainColor} strokeWidth="8" strokeLinecap="round" strokeDasharray="15, 8" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2 }} style={{ filter: `drop-shadow(0 0 8px ${mainColor})` }} />
                           </g>
                         );
                       }
                      case 'DARK_SLASH':
                        const isX = winningSymbol === 'X';
                        const darkBase = isX ? '#312e81' : '#7f1d1d';
                        const darkMain = isX ? '#4f46e5' : '#dc2626';
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={darkBase} strokeWidth="20" strokeLinecap="round" style={{ filter: 'blur(4px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }} transition={{ duration: 0.4, ease: "easeOut" }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={darkMain} strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ filter: `drop-shadow(0 0 10px ${darkMain})` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }} transition={{ duration: 0.6, ease: "easeOut" }} />
                          </g>
                        );
                      case 'HEART_FLUTTER': {
                        const heartColor = '#eab308';
                        const heartGlow = '#facc15';
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={heartGlow} strokeWidth="18" strokeLinecap="round" style={{ filter: 'blur(5px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.4 }} transition={{ duration: 1.0 }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={heartColor} strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.0 }} style={{ filter: `drop-shadow(0 0 8px ${heartColor})` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeDasharray="6, 12" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9, strokeDashoffset: [0, -24] }} transition={{ pathLength: { duration: 1.0 }, strokeDashoffset: { repeat: Infinity, duration: 1.5, ease: "linear" } }} />
                          </g>
                        );
                      }
                      case 'NATURE_LEAF': {
                        const isX = winningSymbol === 'X';
                        const leafColor = isX ? '#0d9488' : '#be123c';
                        const leafGlow = isX ? '#2dd4bf' : '#fb7185';
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={leafGlow} strokeWidth="20" strokeLinecap="round" style={{ filter: 'blur(6px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.3, 0.5, 0.3] }} transition={{ pathLength: { duration: 1.2 }, opacity: { repeat: Infinity, duration: 3, ease: "easeInOut" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={leafColor} strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2 }} style={{ filter: `drop-shadow(0 0 10px ${leafColor})` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isX ? '#a7f3d0' : '#fecdd3'} strokeWidth="3" strokeLinecap="round" strokeDasharray="16, 12" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 1.2 }} />
                          </g>
                        );
                      }
                      case 'VIBRANT_FIRE': {
                        const isX = winningSymbol === 'X';
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#dc2626" strokeWidth="22" strokeLinecap="round" style={{ filter: 'blur(6px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.4, 0.7, 0.4] }} transition={{ pathLength: { duration: 0.6 }, opacity: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6 }} style={{ filter: 'drop-shadow(0 0 12px #f97316)' }} />
                            {isX ? (
                              <>
                                <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeDasharray="30, 20" initial={{ pathLength: 0 }} animate={{ pathLength: 1, strokeDashoffset: [0, -50] }} transition={{ pathLength: { duration: 0.6 }, strokeDashoffset: { repeat: Infinity, duration: 1.0, ease: "linear" } }} />
                                <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeDasharray="15, 25" initial={{ pathLength: 0 }} animate={{ pathLength: 1, strokeDashoffset: [0, 40] }} transition={{ pathLength: { duration: 0.6 }, strokeDashoffset: { repeat: Infinity, duration: 0.8, ease: "linear" } }} />
                              </>
                            ) : (
                              <>
                                <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#facc15" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1, scaleY: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }} transition={{ pathLength: { duration: 0.6 }, scaleY: { repeat: Infinity, duration: 1.5 }, opacity: { repeat: Infinity, duration: 1.5 } }} style={{ transformOrigin: 'center' }} />
                                <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6 }} />
                              </>
                            )}
                          </g>
                        );
                      }
                      case 'OCEAN_SPLASH': {
                        const isX = winningSymbol === 'X';
                        const waveColor = isX ? '#4f46e5' : '#0891b2';
                        const waveGlow = isX ? '#6366f1' : '#22d3ee';
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={waveGlow} strokeWidth="20" strokeLinecap="round" style={{ filter: 'blur(5px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.45 }} transition={{ duration: 0.8 }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={waveColor} strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8 }} style={{ filter: `drop-shadow(0 0 10px ${waveColor})` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="12, 18" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9, strokeDashoffset: [0, -30] }} transition={{ pathLength: { duration: 0.8 }, strokeDashoffset: { repeat: Infinity, duration: 1.2, ease: "linear" } }} />
                          </g>
                        );
                      }
                      case 'COSMIC_NEBULA': {
                        const isX = winningSymbol === 'X';
                        const spaceColor = isX ? '#d946ef' : '#eab308';
                        const spaceGlow = isX ? '#f472b6' : '#fef08a';
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={spaceGlow} strokeWidth="22" strokeLinecap="round" style={{ filter: 'blur(8px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3] }} transition={{ pathLength: { duration: 1.0 }, opacity: { repeat: Infinity, duration: 2.0, ease: "easeInOut" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={spaceColor} strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.0 }} style={{ filter: `drop-shadow(0 0 12px ${spaceColor})` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4, 16" initial={{ pathLength: 0 }} animate={{ pathLength: 1, strokeDashoffset: [0, 20] }} transition={{ pathLength: { duration: 1.0 }, strokeDashoffset: { repeat: Infinity, duration: 1.5, ease: "linear" } }} />
                          </g>
                        );
                      }
                      case 'AURORA_BOREALIS': {
                        const isX = winningSymbol === 'X';
                        const auroraColor = isX ? '#10b981' : '#d946ef';
                        const auroraGlow = isX ? '#6ee7b7' : '#f472b6';
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={auroraGlow} strokeWidth="24" strokeLinecap="round" style={{ filter: 'blur(8px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.3, 0.65, 0.3] }} transition={{ pathLength: { duration: 1.2 }, opacity: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={auroraColor} strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2 }} style={{ filter: `drop-shadow(0 0 12px ${auroraColor})` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeDasharray="2, 10" initial={{ pathLength: 0 }} animate={{ pathLength: 1, strokeDashoffset: [0, -20] }} transition={{ pathLength: { duration: 1.2 }, strokeDashoffset: { repeat: Infinity, duration: 1.0, ease: "linear" } }} />
                          </g>
                        );
                      }
                      case 'ETHEREAL_FROST': {
                        const isX = winningSymbol === 'X';
                        const frostColor = isX ? '#22d3ee' : '#60a5fa'; // cyan / blue
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={frostColor} strokeWidth="20" strokeLinecap="round" style={{ filter: 'blur(6px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ duration: 0.5 }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="6" strokeLinecap="square" strokeDasharray="10 5 2 5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5 }} style={{ filter: `drop-shadow(0 0 10px ${frostColor})` }} />
                          </g>
                        );
                      }
                      case 'ABYSSAL_VOID': {
                        const isX = winningSymbol === 'X';
                        const voidColor = isX ? '#7e22ce' : '#6d28d9'; // purple / violet
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000000" strokeWidth="30" strokeLinecap="round" style={{ filter: 'blur(10px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 0.8 }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={voidColor} strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8 }} style={{ filter: `drop-shadow(0 0 15px ${voidColor})` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeDasharray="5, 15" initial={{ pathLength: 0 }} animate={{ pathLength: 1, strokeDashoffset: [0, 30] }} transition={{ pathLength: { duration: 0.8 }, strokeDashoffset: { repeat: Infinity, duration: 2, ease: "linear" } }} />
                          </g>
                        );
                      }
                      case 'GOLDEN_SOVEREIGN': {
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fef08a" strokeWidth="30" strokeLinecap="round" style={{ filter: 'blur(12px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.4, 0.8, 0.4] }} transition={{ pathLength: { duration: 0.8 }, opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#eab308" strokeWidth="10" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8 }} style={{ filter: `drop-shadow(0 0 10px #facc15)` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.8 }} />
                          </g>
                        );
                      }
                      case 'QUANTUM_GLITCH': {
                        const isX = winningSymbol === 'X';
                        const color1 = isX ? '#22d3ee' : '#e879f9'; // cyan / fuchsia
                        const color2 = '#f43f5e'; // rose
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color2} strokeWidth="8" strokeLinecap="square" style={{ transform: 'translate(4px, 4px)', mixBlendMode: 'screen' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.8, 0.4, 0.9, 0.2, 0.8] }} transition={{ pathLength: { duration: 0.3 }, opacity: { repeat: Infinity, duration: 0.5, ease: "linear" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color1} strokeWidth="8" strokeLinecap="square" style={{ transform: 'translate(-4px, -4px)', mixBlendMode: 'screen' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.4, 0.9, 0.2, 0.8, 0.4] }} transition={{ pathLength: { duration: 0.3 }, opacity: { repeat: Infinity, duration: 0.5, ease: "linear" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="4" strokeLinecap="square" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.3 }} />
                          </g>
                        );
                      }
                      case 'BLOOD_MOON': {
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7f1d1d" strokeWidth="25" strokeLinecap="round" style={{ filter: 'blur(8px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9 }} transition={{ duration: 1 }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#dc2626" strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1 }} style={{ filter: `drop-shadow(0 0 15px #ef4444)` }} />
                          </g>
                        );
                      }
                      case 'RADIANT_SERAPH': {
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="40" strokeLinecap="round" style={{ filter: 'blur(15px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.5, 1, 0.5] }} transition={{ pathLength: { duration: 0.6 }, opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fef08a" strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6 }} style={{ filter: `drop-shadow(0 0 20px #fde047)` }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="6" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6 }} />
                          </g>
                        );
                      }
                      case 'PRISMATIC_DIAMOND': {
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22d3ee" strokeWidth="16" strokeLinecap="round" style={{ filter: 'blur(4px)', transform: 'translate(-2px, -2px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 0.7 }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e879f9" strokeWidth="16" strokeLinecap="round" style={{ filter: 'blur(4px)', transform: 'translate(2px, 2px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 0.7 }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="8" strokeLinecap="square" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.7 }} style={{ filter: `drop-shadow(0 0 10px #ffffff)` }} />
                          </g>
                        );
                      }
                      case 'GALACTIC_SUPERNOVA': {
                        return (
                          <g>
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d946ef" strokeWidth="50" strokeLinecap="round" style={{ filter: 'blur(20px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0.4, 0.8, 0.4] }} transition={{ pathLength: { duration: 0.4 }, opacity: { repeat: Infinity, duration: 1, ease: "easeInOut" } }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22d3ee" strokeWidth="20" strokeLinecap="round" style={{ filter: 'blur(8px)' }} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4 }} />
                            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4 }} style={{ filter: `drop-shadow(0 0 15px #ffffff)` }} />
                          </g>
                        );
                      }
                      default:
                        return defaultLine;
                    }
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

      {/* Floating Chat Bubble */}
      <ChatBubble
        messages={chatMessages}
        onSendMessage={onSendMessage}
        currentUser={username}
        unreadCount={unreadCount}
        onOpen={onChatOpen}
        onClose={onChatClose}
      />
    </LayoutGroup>
  );
};

export default MainGame;
