import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './index.css';

// Components
import Header from './components/Header';
import InformationScreen from './components/InformationScreen';
import MainGame from './components/MainGame';

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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const stompClient = useRef<Stomp.Client | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
        if (message.row !== undefined && message.col !== undefined) {
          const symbol = message.content || (history.length % 2 === 0 ? 'X' : 'O');
          setBoard(prev => {
            const next = prev.map(row => [...row]);
            next[message.row!][message.col!] = symbol;
            return next;
          });
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
    const backendUrl = import.meta.env.VITE_WS_URL || `http://${window.location.hostname}:8888/ws-gomoku`;
    const socket = new SockJS(backendUrl);
    stompClient.current = Stomp.over(socket);
    stompClient.current.debug = () => { };
    stompClient.current.connect({}, () => {
      stompClient.current?.subscribe(`/topic/game/${gameId}`, (payload) => {
        handleMessage(JSON.parse(payload.body));
      });
      stompClient.current?.send("/app/game.join", {}, JSON.stringify({ sender: username, type: 'JOIN', mode: gameMode, gameId }));
    });
  };

  const makeMove = (row: number, col: number) => {
    if (board[row][col] || winner || !isJoined) return;
    
    // Prevent consecutive moves in MULTIPLE mode
    if (gameMode === 'MULTIPLE' && history.length > 0 && history[history.length - 1].player === username) {
      return;
    }

    stompClient.current?.send("/app/game.move", {}, JSON.stringify({ sender: username, type: 'MOVE', row, col, gameId }));
  };

  const resetGame = () => {
    stompClient.current?.send("/app/game.start", {}, JSON.stringify({ sender: username, type: 'START', gameId }));
  };

  const isMyTurn = gameMode === 'SINGLE' || history.length === 0 || history[history.length - 1].player !== username;

  return (
    <div className="flex flex-col min-h-screen w-full bg-surface text-content overflow-x-hidden overflow-y-auto transition-colors duration-300">
      <Header
        isJoined={isJoined}
        scores={scores}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        isLightMode={!isDarkMode}
        setIsLightMode={() => setIsDarkMode(!isDarkMode)}
        isMyTurn={isMyTurn}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
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
          <MainGame
            board={board}
            history={history}
            winner={winner}
            gameId={gameId}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            isMyTurn={isMyTurn}
            makeMove={makeMove}
            resetGame={resetGame}
          />
        )}
      </div>
    </div>
  );
};

export default App;
