"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const uuid_1 = require("uuid");
const UnoGame_1 = require("../game/UnoGame");
class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.clients = new Map();
        this.playerToRoom = new Map();
        this.ROOM_CODE_LENGTH = 6;
        this.ROOM_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        this.MAX_HISTORY = 50;
        this.ROOM_CLEANUP_MS = 24 * 60 * 60 * 1000;
    }
    addClient(ws, name) {
        const clientId = (0, uuid_1.v4)();
        const client = {
            id: clientId,
            name,
            ws,
            roomId: null
        };
        this.clients.set(clientId, client);
        return clientId;
    }
    removeClient(clientId) {
        const client = this.clients.get(clientId);
        if (client && client.roomId) {
            this.leaveRoom(clientId);
        }
        this.clients.delete(clientId);
        this.playerToRoom.delete(clientId);
    }
    getClient(clientId) {
        return this.clients.get(clientId);
    }
    generateRoomCode() {
        const min = 100000;
        const max = 999999;
        return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
    }
    generatePlayerId() {
        return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    createRoom(clientId, roomName) {
        const roomId = this.generateRoomCode();
        const game = new UnoGame_1.UnoGame(roomId, roomName);
        this.rooms.set(roomId, game);
        this.joinRoom(clientId, roomId);
        this.addHistory(game, 'room_created');
        console.log(`Room ${roomId} created by ${this.getClient(clientId)?.name}`);
        return roomId;
    }
    joinRoom(clientId, roomId) {
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
    leaveRoom(clientId) {
        const client = this.clients.get(clientId);
        if (!client || !client.roomId) {
            return;
        }
        const game = this.rooms.get(client.roomId);
        if (game) {
            try {
                const playerId = game.getPlayerIdByClientId(clientId);
                game.removePlayer(playerId);
                const room = game.getRoom();
                if (room.players.length === 0) {
                    this.rooms.delete(client.roomId);
                    console.log(`Room ${client.roomId} deleted (no players)`);
                }
                this.addHistory(game, 'player_left');
            }
            catch (error) {
                // 玩家可能已经不在房间中，忽略错误
                console.log(`Player ${clientId} not found in room ${client.roomId}`);
            }
        }
        const roomName = client.roomId;
        client.roomId = null;
        this.playerToRoom.delete(clientId);
        console.log(`${client.name} left room ${roomName}`);
    }
    getGame(roomId) {
        return this.rooms.get(roomId);
    }
    getRoomList() {
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
    broadcastToRoom(roomId, message, excludeClientId) {
        const game = this.rooms.get(roomId);
        if (!game) {
            return;
        }
        const room = game.getRoom();
        room.players.forEach((player) => {
            const client = this.clients.get(player.id);
            if (client && client.id !== excludeClientId) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client) {
            client.ws.send(JSON.stringify(message));
        }
    }
    getClientsInRoom(roomId) {
        if (roomId === 'all') {
            return Array.from(this.clients.values());
        }
        const game = this.rooms.get(roomId);
        if (!game) {
            return [];
        }
        const room = game.getRoom();
        return room.players
            .map((player) => this.clients.get(player.id))
            .filter((client) => client !== undefined);
    }
    addHistory(game, action) {
        const room = game.getRoom();
        const historyEntry = {
            timestamp: Date.now(),
            players: JSON.parse(JSON.stringify(room.players)),
            state: room.state
        };
        room.history.push(historyEntry);
        if (room.history.length > this.MAX_HISTORY) {
            room.history.shift();
        }
    }
    cleanupOldRooms() {
        const now = Date.now();
        const roomsToDelete = [];
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
    getRoomCount() {
        return this.rooms.size;
    }
    setPlayerToRoom(clientId, roomId) {
        this.playerToRoom.set(clientId, roomId);
    }
    updatePlayerConnection(oldClientId, newClientId, roomId) {
        const client = this.clients.get(newClientId);
        if (client) {
            client.roomId = roomId;
            this.playerToRoom.set(newClientId, roomId);
            this.playerToRoom.delete(oldClientId);
        }
    }
}
exports.RoomManager = RoomManager;
