export interface Move {
  player: string;
  row: number;
  col: number;
  symbol: string;
}

export interface GameMessage {
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
