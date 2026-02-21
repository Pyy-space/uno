export enum CardColor {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  WILD = 'wild'
}

export enum CardType {
  NUMBER = 'number',
  SKIP = 'skip',
  REVERSE = 'reverse',
  DRAW_TWO = 'draw_two',
  WILD = 'wild',
  WILD_DRAW_FOUR = 'wild_draw_four'
}

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isUnoCalled: boolean;
  isReady: boolean;
}

export enum GameDirection {
  CLOCKWISE = 1,
  COUNTER_CLOCKWISE = -1
}

export enum GameState {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export interface RoomHistory {
  timestamp: number;
  players: Player[];
  state: string;
}

export interface PlayerRanking {
  playerId: string;
  playerName: string;
  rank: number;
  finishedAt: Date;
}

export interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  currentPlayerIndex: number;
  direction: GameDirection;
  drawPile: Card[];
  discardPile: Card[];
  state: GameState;
  currentColor: CardColor;
  accumulatedDraw: number;
  lastPlayedCard: Card | null;
  winner: Player | null;
  rankings: PlayerRanking[];
  history: RoomHistory[];
  createdAt: Date;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  playerId?: string;
  roomId?: string;
}
