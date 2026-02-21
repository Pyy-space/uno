import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { UnoGame } from '../game/UnoGame';
import { GameRoom, Player, CardColor } from '../../../shared/src/types';

export interface Client {
  id: string;
  name: string;
  ws: WebSocket;
  roomId: string | null;
}

export interface RoomHistory {
  timestamp: number;
  players: Player[];
  state: string;
}

export class RoomManager {
  private rooms: Map<string, UnoGame> = new Map();
  private clients: Map<string, Client> = new Map();
  private playerToRoom: Map<string, string> = new Map();

  private readonly ROOM_CODE_LENGTH = 6;
  private readonly ROOM_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private readonly MAX_HISTORY = 50;
  private readonly ROOM_CLEANUP_MS = 24 * 60 * 60 * 1000;

  addClient(ws: WebSocket, name: string): string {
    const clientId = uuidv4();
    const client: Client = {
      id: clientId,
      name,
      ws,
      roomId: null
    };
    this.clients.set(clientId, client);
    return clientId;
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client && client.roomId) {
      this.leaveRoom(clientId);
    }
    this.clients.delete(clientId);
    this.playerToRoom.delete(clientId);
  }

  getClient(clientId: string): Client | undefined {
    return this.clients.get(clientId);
  }

  private generateRoomCode(): string {
    const min = 100000;
    const max = 999999;
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  createRoom(clientId: string, roomName: string): string {
    const roomId = this.generateRoomCode();
    const game = new UnoGame(roomId, roomName);
    this.rooms.set(roomId, game);
    this.joinRoom(clientId, roomId);
    this.addHistory(game, 'room_created');
    console.log(`Room ${roomId} created by ${this.getClient(clientId)?.name}`);
    return roomId;
  }

  joinRoom(clientId: string, roomId: string): void {
    const client = this.clients.get(clientId);
    const game = this.rooms.get(roomId);

    if (!client || !game) {
      throw new Error('客户端或房间不存在');
    }

    const room = game.getRoom();
    if (room.players.length >= 7) {
      throw new Error('房间已满');
    }

    if (room.state === 'playing') {
      throw new Error('游戏已开始');
    }

    game.addPlayer(clientId, client.name);
    client.roomId = roomId;
    this.playerToRoom.set(clientId, roomId);
    this.addHistory(game, 'player_joined');
    console.log(`${client.name} joined room ${roomId}`);
  }

  leaveRoom(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.roomId) {
      return;
    }

    const game = this.rooms.get(client.roomId);
    if (game) {
      const playerId = game.getPlayerIdByClientId(clientId);
      game.removePlayer(playerId);
      const room = game.getRoom();
      if (room.players.length === 0) {
        this.rooms.delete(client.roomId);
        console.log(`Room ${client.roomId} deleted (no players)`);
      }
      this.addHistory(game, 'player_left');
    }

    client.roomId = null;
    this.playerToRoom.delete(clientId);
    console.log(`${client.name} left room ${client.roomId}`);
  }

  getGame(roomId: string): UnoGame | undefined {
    return this.rooms.get(roomId);
  }

  getRoomList(): Array<{ id: string; name: string; playerCount: number; state: string }> {
    return Array.from(this.rooms.values()).map(game => {
      const room = game.getRoom();
      return {
        id: room.id,
        name: room.name,
        playerCount: room.players.length,
        state: room.state
      };
    });
  }

  broadcastToRoom(roomId: string, message: any, excludeClientId?: string): void {
    const game = this.rooms.get(roomId);
    if (!game) {
      return;
    }

    const room = game.getRoom();
    room.players.forEach((player: Player) => {
      const client = this.clients.get(player.id);
      if (client && client.id !== excludeClientId) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.ws.send(JSON.stringify(message));
    }
  }

  getClientsInRoom(roomId: string): Client[] {
    if (roomId === 'all') {
      return Array.from(this.clients.values());
    }

    const game = this.rooms.get(roomId);
    if (!game) {
      return [];
    }

    const room = game.getRoom();
    return room.players
      .map((player: Player) => this.clients.get(player.id))
      .filter((client: Client | undefined): client is Client => client !== undefined);
  }

  private addHistory(game: UnoGame, action: string): void {
    const room = game.getRoom();
    const historyEntry: RoomHistory = {
      timestamp: Date.now(),
      players: JSON.parse(JSON.stringify(room.players)),
      state: room.state
    };

    room.history.push(historyEntry);

    if (room.history.length > this.MAX_HISTORY) {
      room.history.shift();
    }
  }

  cleanupOldRooms(): void {
    const now = Date.now();
    const roomsToDelete: string[] = [];

    for (const [roomId, game] of this.rooms.entries()) {
      const room = game.getRoom();
      if (now - room.createdAt.getTime() > this.ROOM_CLEANUP_MS) {
        for (const player of room.players) {
          this.playerToRoom.delete(player.id);
        }
        this.rooms.delete(roomId);
        roomsToDelete.push(roomId);
      }
    }

    if (roomsToDelete.length > 0) {
      console.log(`Cleaned up ${roomsToDelete.length} old rooms`);
    }
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  setPlayerToRoom(clientId: string, roomId: string): void {
    this.playerToRoom.set(clientId, roomId);
  }

  updatePlayerConnection(oldClientId: string, newClientId: string, roomId: string): void {
    const client = this.clients.get(newClientId);
    if (client) {
      client.roomId = roomId;
      this.playerToRoom.set(newClientId, roomId);
      this.playerToRoom.delete(oldClientId);
    }
  }
}
