import { WebSocket } from 'ws';
import { UnoGame } from '../game/UnoGame';
import { Player } from '../../../shared/src/types';
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
export declare class RoomManager {
    private rooms;
    private clients;
    private playerToRoom;
    private readonly ROOM_CODE_LENGTH;
    private readonly ROOM_CODE_CHARS;
    private readonly MAX_HISTORY;
    private readonly ROOM_CLEANUP_MS;
    addClient(ws: WebSocket, name: string): string;
    removeClient(clientId: string): void;
    getClient(clientId: string): Client | undefined;
    private generateRoomCode;
    private generatePlayerId;
    createRoom(clientId: string, roomName: string): string;
    joinRoom(clientId: string, roomId: string): void;
    leaveRoom(clientId: string): void;
    getGame(roomId: string): UnoGame | undefined;
    getRoomList(): Array<{
        id: string;
        name: string;
        playerCount: number;
        state: string;
    }>;
    broadcastToRoom(roomId: string, message: any, excludeClientId?: string): void;
    sendToClient(clientId: string, message: any): void;
    getClientsInRoom(roomId: string): Client[];
    private addHistory;
    cleanupOldRooms(): void;
    getRoomCount(): number;
    setPlayerToRoom(clientId: string, roomId: string): void;
    updatePlayerConnection(oldClientId: string, newClientId: string, roomId: string): void;
}
