import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { Sun, Moon } from 'lucide-react';
import './index.css';

// Components
import InformationScreen from './components/InformationScreen';
import MainGame from './components/MainGame';
import GameHeader from './components/GameHeader';

// Types
import { type Move, type GameMessage } from './types';

const BOARD_SIZE = 20;

const ADJECTIVES = [
  "Sleepy", "Graceful", "Mighty", "Wandering", "Cheerful", "Swift",
  "Noble", "Gentle", "Clever", "Vibrant", "Cunning", "Peaceful",
  "Dashing", "Sturdy", "Loyal", "Wise", "Brave", "Playful"
];

const ANIMALS = [
  "Panda", "Fox", "Crane", "Tiger", "Koi", "Dragon",
  "Badger", "Owl", "Sparrow", "Wolf", "Rabbit", "Deer",
  "Turtle", "Otter", "Falcon", "Lynx", "Phoenix", "Leopard"
];

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
  const [copied, setCopied] = useState<boolean>(false);
  const stompClient = useRef<Stomp.Client | null>(null);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [isLightMode]);

  const generateRandomName = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setUsername(`${adj} ${animal}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    generateRandomName();
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room') || Math.random().toString(36).substring(7);
    setGameId(room);
    if (!urlParams.get('room')) {
      window.history.replaceState({}, '', `?room=${room}`);
    }
  }, []);

  const handleMessage = (message: GameMessage) => {
    switch (message.type) {
      case 'JOIN':
        if (message.scores) setScores(message.scores);
        if (message.history) {
          setHistory(message.history);
          const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
          message.history.forEach(move => {
            newBoard[move.row][move.col] = move.symbol;
          });
          setBoard(newBoard);
        }
        setIsJoined(true);
        break;
      case 'MOVE':
        if (message.row !== undefined && message.col !== undefined && message.sender) {
          const symbol = history.length % 2 === 0 ? 'X' : 'O';
          const newBoard = [...board];
          newBoard[message.row][message.col] = symbol;
          setBoard(newBoard);
          setHistory(prev => [...prev, {
            player: message.sender || 'Unknown',
            row: message.row!,
            col: message.col!,
            symbol
          }]);
        }
        break;
      case 'WIN':
        setWinner(message.winner || 'Someone');
        if (message.scores) setScores(message.scores);
        break;
      case 'START':
        setWinner(null);
        setHistory([]);
        setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
        break;
    }
  };

  const connect = () => {
    if (!username) return;
    const socket = new SockJS(`http://${window.location.hostname}:8888/ws-gomoku`);
    stompClient.current = Stomp.over(socket);
    stompClient.current.debug = () => { };
    stompClient.current.connect({}, () => {
      stompClient.current?.subscribe(`/topic/game/${gameId}`, (payload) => {
        handleMessage(JSON.parse(payload.body));
      });
      stompClient.current?.send(`/app/game/${gameId}/join`, {}, JSON.stringify({ sender: username, type: 'JOIN', mode: gameMode }));
    });
  };

  const makeMove = (row: number, col: number) => {
    if (board[row][col] || winner || !isJoined) return;
    stompClient.current?.send(`/app/game/${gameId}/move`, {}, JSON.stringify({ sender: username, type: 'MOVE', row, col }));
  };

  const resetGame = () => {
    stompClient.current?.send(`/app/game/${gameId}/start`, {}, JSON.stringify({ sender: username, type: 'START' }));
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[var(--bg-color)] text-[var(--text-color)] overflow-hidden">
      {/* Settings Bar */}
      <div className="fixed top-6 right-6 flex gap-3 z-50">
        <button
          className="!bg-none !border-none !shadow-none !backdrop-blur-none p-2 flex items-center justify-center hover:bg-white/5 transition-all duration-200 rounded-full !transform-none !brightness-100"
          onClick={() => setIsLightMode(!isLightMode)}
          title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLightMode ? <Moon size={20} className="text-slate-400 hover:text-blue-400" /> : <Sun size={20} className="text-yellow-400 hover:text-yellow-300" />}
        </button>
      </div>

      {!isJoined ? (
        <InformationScreen
          username={username}
          setUsername={setUsername}
          generateRandomName={generateRandomName}
          gameId={gameId}
          gameMode={gameMode}
          setGameMode={setGameMode}
          copied={copied}
          copyToClipboard={copyToClipboard}
          connect={connect}
        />
      ) : (
        <>
          <GameHeader
            scores={scores}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
          <MainGame
            board={board}
            history={history}
            winner={winner}
            gameId={gameId}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            makeMove={makeMove}
            resetGame={resetGame}
          />
        </>
      )}
    </div>
  );
};

export default App;
