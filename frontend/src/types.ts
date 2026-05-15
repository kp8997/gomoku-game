export interface Move {
  player: string;
  row: number;
  col: number;
  symbol: string;
}

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: number;
}

export interface GameMessage {
  type: 'CHAT' | 'JOIN' | 'MOVE' | 'LEAVE' | 'START' | 'WIN' | 'ROOM_STATUS' | 'ERROR';
  content?: string;
  sender?: string;
  row?: number;
  col?: number;
  gameId?: string;
  mode?: 'SINGLE' | 'MULTIPLE';
  history?: Move[];
  chatHistory?: ChatMessage[];
  winner?: string;
  scores?: Record<string, number>;
  playerCount?: number;
  timestamp?: number;
  winningLine?: Move[];
  turnStartTime?: number;
  turnDuration?: number;
  playerSymbol?: string;
}

// Auth
export interface SignupRequest {
  username: string;
  password: string;
  fullName: string;
  avatar?: string; // Base64
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  avatar: string | null;
}

export interface UserProfile {
  username: string;
  fullName: string;
  avatar: string | null;
}

export interface ConfrontationRecord {
  opponentUsername: string;
  opponentFullName: string;
  opponentAvatar: string | null;
  wins: number;
  losses: number;
}
