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
  type: 'CHAT' | 'JOIN' | 'MOVE' | 'LEAVE' | 'START' | 'WIN' | 'ROOM_STATUS' | 'ERROR'
      | 'VOICE_CALL_REQUEST' | 'VOICE_CALL_RESPONSE' | 'VOICE_OFFER' | 'VOICE_ANSWER' | 'VOICE_ICE' | 'VOICE_HANG_UP';
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
  symbolEffects?: Record<string, string>;
  symbolSkins?: Record<string, string>;
  // Voice signaling fields
  sdp?: string;
  iceCandidate?: string;
  accepted?: boolean;
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

export interface UserStatsDTO {
  totalWins: number;
  totalLosses: number;
  totalMatches: number;
  winRate: number;
}

export type EffectType = 'FIRE_PHOENIX' | 'DRAGON_LIGHTNING' | 'HEART_FLUTTER' | 'CHERRY_BLOSSOM' | 'NATURE_LEAF' | 'VIBRANT_FIRE' | 'OCEAN_SPLASH' | 'COSMIC_NEBULA' | 'DARK_SLASH' | 'AURORA_BOREALIS' | 'ETHEREAL_FROST' | 'ABYSSAL_VOID' | 'GOLDEN_SOVEREIGN' | 'QUANTUM_GLITCH' | 'BLOOD_MOON' | 'RADIANT_SERAPH' | 'PRISMATIC_DIAMOND' | 'GALACTIC_SUPERNOVA' | null;

export type SymbolSkinType = 'CAT_PAW' | 'KITTY_FACE' | 'BUBBLE_TEA' | 'STAR_CHARM' | 'HEART_BOW' | 'LOTUS' | 'MOON_BUNNY' | 'LUCKY_CAT' | 'KING_GEORGE' | 'PINK_LOOPY' | null;

export interface AchievementDTO {
  key: string;
  category: 'WIN_RATE' | 'MATCHES' | 'WINS';
  label: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
  threshold: number;
}

export interface EffectDTO {
  key: EffectType;
  unlocked: boolean;
  requirementLabel: string;
}

export interface SymbolSkinDTO {
  key: SymbolSkinType;
  displayName: string;
  unlocked: boolean;
  requirementLabel: string;
}

export interface AchievementResponse {
  winRateBadges: AchievementDTO[];
  matchBadges: AchievementDTO[];
  winBadges: AchievementDTO[];
  effects: EffectDTO[];
  equippedEffect: EffectType;
  skins: SymbolSkinDTO[];
  equippedSkin: SymbolSkinType;
}

