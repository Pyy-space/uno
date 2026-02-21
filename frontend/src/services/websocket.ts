import { ref } from 'vue';

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
}

export interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  state: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  private connected = ref(false);
  private clientId = ref('');
  private playerName = ref('');
  private currentRoom = ref<GameRoom | null>(null);
  private roomList = ref<RoomInfo[]>([]);
  private gameLog = ref<string[]>([]);

  constructor() {
    // 从本地存储加载游戏状态
    this.loadGameState();
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket('ws://localhost:3001');

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.connected.value = true;
        this.reconnectAttempts = 0;
        // 连接成功后尝试重新加入房间
        this.tryRejoinRoom();
      };

      this.ws.onmessage = (event) => {
        try {
          if (!event.data || event.data === '') {
            return;
          }
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error, 'Data:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.connected.value = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private saveGameState(): void {
    const gameState = {
      clientId: this.clientId.value,
      playerName: this.playerName.value,
      currentRoom: this.currentRoom.value
    };
    localStorage.setItem('unoGameState', JSON.stringify(gameState));
  }

  private loadGameState(): void {
    const savedState = localStorage.getItem('unoGameState');
    if (savedState) {
      try {
        const gameState = JSON.parse(savedState);
        this.clientId.value = gameState.clientId || '';
        this.playerName.value = gameState.playerName || '';
        this.currentRoom.value = gameState.currentRoom || null;
      } catch (error) {
        console.error('Error loading game state:', error);
        localStorage.removeItem('unoGameState');
      }
    }
  }

  private clearGameState(): void {
    localStorage.removeItem('unoGameState');
  }

  private tryRejoinRoom(): void {
    if (this.currentRoom.value && this.playerName.value) {
      console.log('Attempting to rejoin room:', this.currentRoom.value.id);
      this.send('rejoin_room', {
        roomId: this.currentRoom.value.id,
        playerName: this.playerName.value,
        clientId: this.clientId.value
      });
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    }
  }

  private handleMessage(message: any): void {
    const { type, ...data } = message;

    if (type === 'connected') {
      this.clientId.value = data.clientId;
      this.playerName.value = data.playerName;
      this.saveGameState();
    } else if (type === 'room_list') {
      this.roomList.value = data.rooms || [];
    } else if (type === 'room_created' || type === 'room_joined' || type === 'game_started' || type === 'game_state_updated' || type === 'rejoin_success') {
      if (data.gameState) {
        this.currentRoom.value = data.gameState;
        this.saveGameState();
      }
    } else if (type === 'room_left') {
      this.currentRoom.value = null;
      this.gameLog.value = [];
      this.clearGameState();
    } else if (type === 'player_joined' || type === 'player_left') {
      if (data.gameState) {
        this.currentRoom.value = data.gameState;
        this.saveGameState();
      }
    } else if (type === 'game_log') {
      if (data.log) {
        this.gameLog.value.push(data.log);
        if (this.gameLog.value.length > 50) {
          this.gameLog.value.shift();
        }
      }
    } else if (type === 'error') {
      console.error('Server error:', data.error);
    }

    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  on(eventType: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  createRoom(roomName: string, playerName: string): void {
    this.playerName.value = playerName;
    this.send('create_room', { roomName, playerName });
  }

  joinRoom(roomId: string, playerName: string): void {
    this.playerName.value = playerName;
    this.send('join_room', { roomId, playerName });
  }

  leaveRoom(): void {
    this.send('leave_room', {});
    this.clearGameState();
  }

  startGame(): void {
    this.send('start_game', {});
  }

  playCard(cardId: string, chosenColor?: CardColor): void {
    this.send('play_card', { cardId, chosenColor });
  }

  drawCard(): void {
    this.send('draw_card', {});
  }

  callUno(): void {
    this.send('call_uno', {});
  }

  challengeUno(): void {
    this.send('challenge_uno', {});
  }

  challengeDrawFour(): void {
    this.send('challenge_draw_four', {});
  }

  requestRoomList(): void {
    this.send('get_room_list', {});
  }

  toggleReady(): void {
    this.send('toggle_ready', {});
  }

  private send(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.error('WebSocket is not connected');
      // 直接重连
      this.connect();
      // 延迟发送
      setTimeout(() => {
        this.send(type, data);
      }, 1000);
    }
  }

  getConnected(): boolean {
    return this.connected.value;
  }

  getClientId(): string {
    return this.clientId.value;
  }

  getPlayerName(): string {
    return this.playerName.value;
  }

  getCurrentRoom(): GameRoom | null {
    return this.currentRoom.value;
  }

  getRoomList(): RoomInfo[] {
    return this.roomList.value;
  }

  getGameLog(): string[] {
    return this.gameLog.value;
  }
}

const wsService = new WebSocketService();

export function useWebSocket() {
  return wsService;
}
