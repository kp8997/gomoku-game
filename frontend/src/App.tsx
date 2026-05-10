import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Trophy, History as HistoryIcon, Hash } from 'lucide-react';
import './index.css';

const BOARD_SIZE = 30;

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
  const [gameMode, setGameMode] = useState<'SINGLE' | 'MULTIPLE'>('MULTIPLE');
  const [history, setHistory] = useState<Move[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const stompClient = useRef<Stomp.Client | null>(null);

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
    stompClient.current.debug = () => {}; // Disable debug logs

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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass glow-border p-8 max-w-md w-full flex flex-col gap-6 items-center"
        >
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
            <User size={40} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">Gomoku Arena</h1>
          <p className="text-slate-400 text-center text-sm mb-4">Strategic 30x30 real-time battle</p>
          
          <div className="w-full space-y-6">
            <div className="space-y-3">
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

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Select Game Mode</label>
            <div className="glass p-4 rounded-2xl flex items-center justify-between shadow-inner w-full border border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-white font-semibold">Multiplayer Mode</span>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                  {gameMode === 'MULTIPLE' ? 'Online PvP Enabled' : 'Local Training Only'}
                </span>
              </div>
              <div 
                onClick={() => setGameMode(gameMode === 'MULTIPLE' ? 'SINGLE' : 'MULTIPLE')}
                className={`w-[51px] h-[31px] rounded-full p-[2px] cursor-pointer transition-colors duration-300 relative ${gameMode === 'MULTIPLE' ? 'bg-[#007AFF]' : 'bg-[#39393d]'}`}
              >
                <motion.div 
                  className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
                  animate={{ x: gameMode === 'MULTIPLE' ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
            </div>
          </div>

          <button onClick={connect} className="w-full text-lg mt-8 h-14 shadow-lg shadow-blue-500/20">
            Join Room: {gameId}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar - History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ width: 0, opacity: 0, x: -50 }}
            animate={{ width: 320, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -50 }}
            className="w-80 glass m-4 flex flex-col overflow-hidden relative"
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
      </AnimatePresence>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="mb-6 flex items-center justify-between w-full max-w-[780px]">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="glass p-2 px-4 flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <HistoryIcon size={18} />
              <span className="text-sm font-medium">{showHistory ? 'Hide' : 'Show'} History</span>
            </button>
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
                    <span className="text-sm font-medium">Player X</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
                    <span className="text-sm font-medium">Player O</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-slate-400 text-sm">30x30 Grid</div>
        </div>

        <div className="board-wrapper glass rounded-xl border border-white/10 shadow-2xl custom-scrollbar">
          <div className="game-board">
            {board.map((row, r) => 
              row.map((cell, c) => (
                <div 
                  key={`${r}-${c}`} 
                  className="cell"
                  onClick={() => makeMove(r, c)}
                >
                  {cell === 'X' && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="stone-x">X</motion.span>
                  )}
                  {cell === 'O' && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="stone-o">O</motion.span>
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
      </div>
    </div>
  );
};

export default App;
