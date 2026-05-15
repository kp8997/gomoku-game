import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './index.css';

// Components
import Header from './components/Header';
import InformationScreen from './components/InformationScreen';
import MainGame from './components/MainGame';
import TimeoutWarning from './components/TimeoutWarning';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';

// Types
import { type Move, type GameMessage, type ChatMessage } from './types';

// Context
import { useAuth } from './context/AuthContext';

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
  const { user, isAuthenticated } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [gameId, setGameId] = useState<string>('');
  const [gameMode, setGameMode] = useState<'SINGLE' | 'MULTIPLE'>('MULTIPLE');
  const [history, setHistory] = useState<Move[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [winningLine, setWinningLine] = useState<Move[]>([]);
  const [_stats, setStats] = useState<{ wins: number, losses: number }>({ wins: 0, losses: 0 });
  const [turnStartTime, setTurnStartTime] = useState<number>(0);
  const [turnDuration, setTurnDuration] = useState<number>(60);
  const [mySymbol, setMySymbol] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [turnSymbol, setTurnSymbol] = useState<'X' | 'O'>('X');

  // Occupancy States
  const [serverGameMode, setServerGameMode] = useState<'SINGLE' | 'MULTIPLE' | null>(null);
  const [isRoomFull, setIsRoomFull] = useState<boolean>(false);
  const [roomFullReason, setRoomFullReason] = useState<string | null>(null);

  // Auth Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

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
    if (isAuthenticated && user) {
      setUsername(user.username);
    } else if (!username) {
      generateRandomName();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room') || Math.random().toString(36).substring(7);
    setGameId(room);
    if (!urlParams.get('room')) {
      window.history.replaceState({}, '', `?room=${room}`);
    }

    // Connect early to check room status (but don't block render)
    const backendUrl = import.meta.env.VITE_WS_URL || `http://${window.location.hostname}:8888/ws-gomoku`;
    const socket = new SockJS(backendUrl);
    const client = Stomp.over(socket);
    client.debug = () => { };

    const connectToBackend = () => {
      client.connect({},
        () => {
          stompClient.current = client;
          client.subscribe(`/topic/game/${room}`, (payload) => {
            handleMessage(JSON.parse(payload.body));
          });
          // Query room status immediately
          client.send("/app/game.status", {}, JSON.stringify({ gameId: room }));
        },
        (error) => {
          console.warn("Backend unavailable or connection failed:", error);
          // We don't block the UI, user can still see the screen
          // We might want to retry later or just let them try to 'Join' manually
          setTimeout(connectToBackend, 5000); // Simple retry
        }
      );
    };

    connectToBackend();

    return () => {
      if (client.connected) {
        client.disconnect(() => { });
      }
    };
  }, []);

  const handleMessage = (message: GameMessage) => {
    switch (message.type) {
      case 'ROOM_STATUS':
        console.log("Received ROOM_STATUS:", message);
        if (message.mode) setGameMode(message.mode);
        setServerGameMode(message.mode || null);
        const currentCount = message.playerCount || 0;
        setPlayerCount(currentCount);
        const max = (message.mode === 'SINGLE' && currentCount <= 1) ? 1 : 2;

        if (currentCount >= max) {
          setIsRoomFull(true);
          setRoomFullReason(`Arena is currently full (${currentCount}/${max}). Please try a different room or wait for a slot.`);
        } else {
          setIsRoomFull(false);
          setRoomFullReason(null);
        }
        break;
      case 'CHAT':
        setChatMessages(prev => [...prev, {
          sender: message.sender || 'Anonymous',
          content: message.content || '',
          timestamp: message.timestamp || Date.now()
        }]);
        break;
      case 'JOIN':
        if (message.scores) setScores(message.scores);
        if (message.history) {
          setHistory(message.history);
          const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
          message.history.forEach(move => {
            newBoard[move.row][move.col] = move.symbol;
          });
          setBoard(newBoard);
          setTurnSymbol(message.history.length % 2 === 0 ? 'X' : 'O');
        }
        if (message.mode) setGameMode(message.mode);
        if (message.chatHistory) {
          setChatMessages(message.chatHistory.map(msg => ({
            sender: msg.sender || 'Anonymous',
            content: msg.content || '',
            timestamp: msg.timestamp || Date.now()
          })));
        }
        if (message.turnStartTime !== undefined) setTurnStartTime(message.turnStartTime);
        if (message.turnDuration !== undefined) setTurnDuration(message.turnDuration);
        if (message.sender === username && message.playerSymbol) setMySymbol(message.playerSymbol);
        if (message.playerCount !== undefined) setPlayerCount(message.playerCount);
        setIsJoined(true);
        break;
      case 'MOVE':
        if (message.row !== undefined && message.col !== undefined) {
          setHistory(prevHistory => {
            const isDuplicate = prevHistory.some(m => m.row === message.row && m.col === message.col);
            if (isDuplicate) return prevHistory;
            
            const symbol = message.content || (prevHistory.length % 2 === 0 ? 'X' : 'O');
            
            // Schedule updates for other states
            setBoard(prevBoard => {
              const next = prevBoard.map(row => [...row]);
              next[message.row!][message.col!] = symbol;
              return next;
            });
            setTurnSymbol(symbol === 'X' ? 'O' : 'X');
            if (message.turnStartTime !== undefined) setTurnStartTime(message.turnStartTime);
            if (message.turnDuration !== undefined) setTurnDuration(message.turnDuration);

            return [...prevHistory, {
              player: message.sender || 'Unknown',
              row: message.row!,
              col: message.col!,
              symbol
            }];
          });
        }
        break;
      case 'WIN':
        setWinner(message.winner || 'Someone');
        if (message.scores) setScores(message.scores);
        if (message.winningLine) setWinningLine(message.winningLine);

        // Update local stats
        if (message.winner) {
          const isWinner = gameMode === 'SINGLE' || message.winner === username;
          setStats(prev => ({
            wins: isWinner ? prev.wins + 1 : prev.wins,
            losses: isWinner ? prev.losses : prev.losses + 1
          }));
        }
        break;
      case 'START':
        setWinner(null);
        setWinningLine([]);
        setHistory([]);
        setTurnSymbol('X');
        setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
        if (message.turnStartTime !== undefined) setTurnStartTime(message.turnStartTime);
        if (message.turnDuration !== undefined) setTurnDuration(message.turnDuration);
        break;
    }
  };

  const createNewRoom = () => {
    const newRoom = Math.random().toString(36).substring(7);
    window.location.href = `?room=${newRoom}`; // Hard refresh to reset everything properly
  };

  const connect = () => {
    if (!username || isRoomFull) return;
    stompClient.current?.send("/app/game.join", {}, JSON.stringify({ sender: username, type: 'JOIN', mode: gameMode, gameId }));
  };

  const makeMove = (row: number, col: number) => {
    if (board[row][col] || winner || !isJoined) return;

    // Prevent consecutive moves in MULTIPLE mode
    if (gameMode === 'MULTIPLE' && history.length > 0 && history[history.length - 1].player === username) {
      return;
    }

    stompClient.current?.send("/app/game.move", {}, JSON.stringify({ sender: username, type: 'MOVE', row, col, gameId }));
  };

  const sendChatMessage = (content: string) => {
    if (stompClient.current && stompClient.current.connected && content.trim()) {
      stompClient.current.send("/app/game.chat", {}, JSON.stringify({ type: 'CHAT', content, gameId, sender: username }));
    }
  };

  const resetGame = () => {
    stompClient.current?.send("/app/game.start", {}, JSON.stringify({ sender: username, type: 'START', gameId }));
  };

  const leaveGame = () => {
    setIsJoined(false);
    setWinner(null);
    setWinningLine([]);
    setHistory([]);
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    // We stay connected but logically "leave" the match screen
  };

  const isMyTurn = (gameMode === 'SINGLE' || (
    mySymbol ? turnSymbol === mySymbol : history.length === 0 || history[history.length - 1].player !== username
  )) && (gameMode === 'SINGLE' || playerCount >= 2);

  return (
    <div className="flex flex-col min-h-screen w-full bg-surface text-content overflow-x-hidden overflow-y-auto transition-colors duration-300">
      <Header
        isJoined={isJoined}
        scores={scores}
        showDrawer={showDrawer}
        setShowDrawer={setShowDrawer}
        isLightMode={!isDarkMode}
        setIsLightMode={() => setIsDarkMode(!isDarkMode)}
        isMyTurn={isMyTurn}
        leaveGame={leaveGame}
        username={username}
        turnStartTime={turnStartTime}
        turnDuration={turnDuration}
        isGameOver={!!winner}
        gameMode={gameMode}
        currentTurnSymbol={turnSymbol}
        playerCount={playerCount}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        isAuthenticated={isAuthenticated}
        userAvatar={user?.avatar || null}
        userFullName={user?.fullName || null}
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
            isRoomFull={isRoomFull}
            roomFullReason={roomFullReason}
            serverGameMode={serverGameMode}
            createNewRoom={createNewRoom}
            onOpenAuth={() => setShowAuthModal(true)}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <MainGame
            board={board}
            history={history}
            winner={winner}
            gameId={gameId}
            showDrawer={showDrawer}
            setShowDrawer={setShowDrawer}
            isMyTurn={isMyTurn}
            makeMove={makeMove}
            resetGame={resetGame}
            chatMessages={chatMessages}
            onSendMessage={sendChatMessage}
            username={username}
            winningLine={winningLine}
          />
        )}
      </div>

      {/* Global Timeout Warning Overlay */}
      <TimeoutWarning 
        startTime={turnStartTime}
        duration={turnDuration}
        isMyTurn={isMyTurn}
        isPaused={!!winner}
      />

      {/* Auth Modals */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default App;
