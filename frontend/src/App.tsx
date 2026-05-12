import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Trophy, History as HistoryIcon, Hash, Sun, Moon } from 'lucide-react';
import './index.css';

const BOARD_SIZE = 20;

interface Move {
  player: string;
  row: number;
  col: number;
  symbol: string;
}

interface GameMessage {
  type: 'CHAT' | 'JOIN' | 'MOVE' | 'LEAVE' | 'START' | 'WIN';
  content?: string;
  sender?: string;
  row?: number;
  col?: number;
  gameId?: string;
  mode?: 'SINGLE' | 'MULTIPLE';
  history?: Move[];
  winner?: string;
  scores?: Record<string, number>;
}

const App: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [gameId, setGameId] = useState<string>('');
  const [gameMode, setGameMode] = useState<'SINGLE' | 'MULTIPLE'>('SINGLE');
  const [history, setHistory] = useState<Move[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const stompClient = useRef<Stomp.Client | null>(null);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [isLightMode]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room') || Math.random().toString(36).substring(7);
    setGameId(room);
    if (!urlParams.get('room')) {
      window.history.replaceState({}, '', `?room=${room}`);
    }
  }, []);

  const connect = () => {
    if (!username) return;

    const socket = new SockJS(`http://${window.location.hostname}:8888/ws-gomoku`);
    stompClient.current = Stomp.over(socket);
    stompClient.current.debug = () => { }; // Disable debug logs

    stompClient.current.connect({}, () => {
      stompClient.current?.subscribe(`/topic/game/${gameId}`, (payload) => {
        const message: GameMessage = JSON.parse(payload.body);
        handleMessage(message);
      });

      stompClient.current?.send('/app/game.join', {}, JSON.stringify({
        type: 'JOIN',
        sender: username,
        gameId: gameId,
        mode: gameMode
      }));

      setIsJoined(true);
    });
  };

  const handleMessage = (message: GameMessage) => {
    if (message.type === 'MOVE') {
      if (message.row !== undefined && message.col !== undefined && message.content) {
        const { row, col, content, sender } = message;

        setBoard(prevBoard => {
          const newBoard = prevBoard.map(r => [...r]);
          newBoard[row][col] = content!;
          return newBoard;
        });

        setHistory(prev => [...prev, {
          player: sender || '',
          row: row!,
          col: col!,
          symbol: content!
        }]);
      }
    } else if (message.type === 'JOIN') {
      if (message.history) {
        const restoredBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        message.history.forEach(move => {
          restoredBoard[move.row][move.col] = move.symbol;
        });
        setBoard(restoredBoard);
        setHistory(message.history);
      }
      if (message.mode) {
        setGameMode(message.mode as 'SINGLE' | 'MULTIPLE');
      }
      if (message.scores) {
        setScores(message.scores);
      }
    } else if (message.type === 'WIN') {
      setWinner(message.winner || 'Someone');
      if (message.scores) {
        setScores(message.scores);
      }
    } else if (message.type === 'START') {
      setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
      setHistory([]);
      setWinner(null);
    }
  };

  const makeMove = (row: number, col: number) => {
    if (board[row][col] || winner) return;

    // Local turn check for MULTIPLE mode
    if (gameMode === 'MULTIPLE' && history.length > 0) {
      const lastMove = history[history.length - 1];
      if (lastMove.player === username) {
        return; // Not your turn
      }
    }

    stompClient.current?.send('/app/game.move', {}, JSON.stringify({
      type: 'MOVE',
      sender: username,
      gameId: gameId,
      row: row,
      col: col
    }));
  };

  const resetGame = () => {
    stompClient.current?.send('/app/game.start', {}, JSON.stringify({
      type: 'START',
      sender: username,
      gameId: gameId
    }));
  };

  if (!isJoined) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-screen p-4">
        {/* Fixed Settings Bar */}
        <div className="settings-bar">
          <button
            className="settings-btn"
            onClick={() => setIsLightMode(!isLightMode)}
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glow-border max-w-md w-full relative"
        >
          <div className="glass px-10 py-14 w-full flex flex-col gap-12 items-center relative z-10">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
              <User size={40} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">Gomoku Arena</h1>
            <p className="text-slate-400 text-center text-sm mb-4">Strategic 20x20 real-time battle</p>

            <div className="w-full flex flex-col gap-10">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name..."
                  className="w-full text-center"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && connect()}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Network Mode</label>
                <div className="flex gap-2">
                  <button disabled className="flex-1 py-4 px-4 rounded-xl bg-white/5 text-slate-500 text-sm font-medium border border-white/5 cursor-not-allowed text-left flex justify-between items-center opacity-70">
                    <span>Online</span>
                    <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-slate-400">Disabled</span>
                  </button>
                  <button className="flex-1 py-4 px-4 rounded-xl bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30 text-left flex justify-between items-center ring-1 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <span>Offline</span>
                    <span className="text-[10px] uppercase tracking-wider bg-blue-500/30 px-2 py-0.5 rounded text-blue-200">Default</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Offline Game Type</label>
                <div
                  onClick={() => setGameMode(prev => prev === 'MULTIPLE' ? 'SINGLE' : 'MULTIPLE')}
                  className="bg-[#1e293b]/50 p-4 rounded-2xl flex items-center justify-between w-full border border-white/5 cursor-pointer hover:bg-[#1e293b]/80 transition-all duration-300"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-medium">
                      {gameMode === 'SINGLE' ? 'Single Player (Hotseat)' : 'Multiplayer (LAN)'}
                    </span>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                      {gameMode === 'SINGLE' ? '2 players on same machine' : 'Other sockets at same URL'}
                    </span>
                  </div>
                  <label className="game-mode-switch">
                    <input type="checkbox" readOnly checked={gameMode === 'MULTIPLE'} />
                    <span className="game-mode-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="w-full mt-4">
              <button onClick={connect} className="w-full text-lg h-14 shadow-lg shadow-blue-500/20">
                Join Room: {gameId}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Fixed Settings Bar — visible on all screens */}
      <div className="settings-bar">
        <button
          className="settings-btn"
          onClick={() => setIsLightMode(!isLightMode)}
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Separate Header at Top */}
      <header className="game-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="glass p-2 px-4 flex items-center gap-2 hover:bg-white/10 transition-colors"
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
        </div>

        <div className="text-slate-400 text-sm hidden lg:block">20x20 Strategic Grid</div>
      </header>

      <div className="game-content">
        {/* Sidebar - History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: -50 }}
              animate={{ width: window.innerWidth <= 768 ? '85vw' : 320, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -50 }}
              className="history-sidebar glass m-0 md:m-4 flex flex-col overflow-hidden relative shadow-2xl z-[100]"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HistoryIcon size={20} className="text-blue-400" />
                  <h2 className="font-bold text-lg">History</h2>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-white/10 rounded-full bg-transparent"
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
        </AnimatePresence>        {/* Main Game Area */}
        <main className="game-main">
          <div className="board-wrapper glass rounded-xl border border-white/10 shadow-2xl custom-scrollbar">
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
                <div className="glass p-12 text-center flex flex-col items-center gap-6 glow-border">
                  <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Trophy size={60} className="text-yellow-400" />
                  </div>
                  <h2 className="text-5xl font-bold text-white">{winner} WINS!</h2>
                  <p className="text-slate-400">The game has been decided.</p>
                  <button onClick={resetGame} className="mt-4 px-10 py-4 text-xl">
                    Play Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
