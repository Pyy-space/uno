"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnoServer = void 0;
const ws_1 = require("ws");
const RoomManager_1 = require("./RoomManager");
const messages_1 = require("./messages");
class UnoServer {
    constructor(port = 3001) {
        this.wss = new ws_1.WebSocketServer({ port });
        this.roomManager = new RoomManager_1.RoomManager();
        this.setupServer();
        this.startCleanup();
        console.log(`WebSocket server running on port ${port}`);
    }
    startCleanup() {
        setInterval(() => {
            this.roomManager.cleanupOldRooms();
        }, 60 * 60 * 1000);
    }
    setupServer() {
        this.wss.on('connection', (ws) => {
            let clientId = null;
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(ws, clientId, message);
                }
                catch (error) {
                    console.error('Error parsing message:', error);
                    this.sendError(ws, 'Invalid message format');
                }
            });
            ws.on('close', () => {
                if (clientId) {
                    this.roomManager.removeClient(clientId);
                }
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
            const name = `Player_${Math.floor(Math.random() * 1000)}`;
            clientId = this.roomManager.addClient(ws, name);
            this.sendToClient(ws, {
                type: 'connected',
                clientId,
                playerName: name
            });
        });
    }
    handleMessage(ws, clientId, message) {
        if (!clientId) {
            this.sendError(ws, 'Not connected');
            return;
        }
        const client = this.roomManager.getClient(clientId);
        if (!client) {
            this.sendError(ws, 'Client not found');
            return;
        }
        switch (message.type) {
            case messages_1.MessageType.CREATE_ROOM:
                this.handleCreateRoom(clientId, message.roomName, message.playerName);
                break;
            case messages_1.MessageType.JOIN_ROOM:
                this.handleJoinRoom(clientId, message.roomId, message.playerName);
                break;
            case messages_1.MessageType.LEAVE_ROOM:
                this.handleLeaveRoom(clientId);
                break;
            case messages_1.MessageType.START_GAME:
                this.handleStartGame(clientId);
                break;
            case messages_1.MessageType.PLAY_CARD:
                this.handlePlayCard(clientId, message.cardId, message.chosenColor);
                break;
            case messages_1.MessageType.DRAW_CARD:
                this.handleDrawCard(clientId);
                break;
            case messages_1.MessageType.CALL_UNO:
                this.handleCallUno(clientId);
                break;
            case messages_1.MessageType.CHALLENGE_UNO:
                this.handleChallengeUno(clientId, message.targetPlayerId);
                break;
            case messages_1.MessageType.CHALLENGE_WILD_DRAW_FOUR:
                this.handleChallengeWildDrawFour(clientId, message.targetPlayerId);
                break;
            case messages_1.MessageType.GET_ROOM_LIST:
                this.handleGetRoomList(clientId);
                break;
            case messages_1.MessageType.TOGGLE_READY:
                this.handleToggleReady(clientId);
                break;
            case messages_1.MessageType.REJOIN_ROOM:
                this.handleRejoinRoom(clientId, message.roomId, message.playerName, message.clientId);
                break;
            default:
                this.sendError(ws, 'Unknown message type');
        }
    }
    handleCreateRoom(clientId, roomName, playerName) {
        try {
            const client = this.roomManager.getClient(clientId);
            if (client) {
                client.name = playerName;
            }
            const roomId = this.roomManager.createRoom(clientId, roomName);
            const game = this.roomManager.getGame(roomId);
            if (game) {
                this.sendToClient(clientId, {
                    type: messages_1.MessageType.ROOM_CREATED,
                    roomId,
                    roomName,
                    gameState: game.getRoomCopy()
                });
                this.broadcastRoomList();
            }
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    handleJoinRoom(clientId, roomId, playerName) {
        try {
            const client = this.roomManager.getClient(clientId);
            if (client) {
                client.name = playerName;
            }
            this.roomManager.joinRoom(clientId, roomId);
            const game = this.roomManager.getGame(roomId);
            if (game) {
                const gameState = game.getRoomCopy();
                this.sendToClient(clientId, {
                    type: messages_1.MessageType.ROOM_JOINED,
                    roomId,
                    gameState
                });
                this.roomManager.broadcastToRoom(roomId, {
                    type: messages_1.MessageType.PLAYER_JOINED,
                    playerId: clientId,
                    playerName: this.roomManager.getClient(clientId)?.name,
                    gameState
                }, clientId);
                this.broadcastRoomList();
            }
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    handleLeaveRoom(clientId) {
        const client = this.roomManager.getClient(clientId);
        if (!client || !client.roomId) {
            return;
        }
        const roomId = client.roomId;
        this.roomManager.leaveRoom(clientId);
        this.sendToClient(clientId, {
            type: messages_1.MessageType.ROOM_LEFT
        });
        const game = this.roomManager.getGame(roomId);
        if (game) {
            this.roomManager.broadcastToRoom(roomId, {
                type: messages_1.MessageType.PLAYER_LEFT,
                playerId: clientId,
                gameState: game.getRoomCopy()
            });
        }
        this.broadcastRoomList();
    }
    handleStartGame(clientId) {
        const client = this.roomManager.getClient(clientId);
        if (!client || !client.roomId) {
            this.sendError(clientId, 'Not in a room');
            return;
        }
        const game = this.roomManager.getGame(client.roomId);
        if (!game) {
            this.sendError(clientId, 'Room not found');
            return;
        }
        try {
            game.startGame();
            const gameState = game.getRoomCopy();
            this.roomManager.broadcastToRoom(client.roomId, {
                type: messages_1.MessageType.GAME_STARTED,
                gameState
            });
            this.broadcastGameLog(client.roomId, '🎮 游戏开始！');
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    broadcastGameLog(roomId, message) {
        const timestamp = new Date().toLocaleTimeString();
        this.roomManager.broadcastToRoom(roomId, {
            type: messages_1.MessageType.GAME_LOG,
            log: `[${timestamp}] ${message}`
        });
    }
    handlePlayCard(clientId, cardId, chosenColor) {
        const client = this.roomManager.getClient(clientId);
        if (!client || !client.roomId) {
            this.sendError(clientId, 'Not in a room');
            return;
        }
        const game = this.roomManager.getGame(client.roomId);
        if (!game) {
            this.sendError(clientId, 'Room not found');
            return;
        }
        try {
            const room = game.getRoom();
            const player = room.players.find(p => p.id === clientId);
            const card = player?.hand.find(c => c.id === cardId);
            game.playCard(clientId, cardId, chosenColor);
            const gameState = game.getRoomCopy();
            let logMessage = `${client?.name || 'Player'} 出了牌`;
            if (chosenColor) {
                const colorNames = {
                    red: '红色',
                    yellow: '黄色',
                    green: '绿色',
                    blue: '蓝色'
                };
                logMessage += ` 并选择了 ${colorNames[chosenColor] || chosenColor}`;
            }
            this.broadcastGameLog(client.roomId, logMessage);
            this.roomManager.broadcastToRoom(client.roomId, {
                type: messages_1.MessageType.GAME_STATE_UPDATED,
                gameState
            });
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    handleDrawCard(clientId) {
        const client = this.roomManager.getClient(clientId);
        if (!client || !client.roomId) {
            this.sendError(clientId, 'Not in a room');
            return;
        }
        const game = this.roomManager.getGame(client.roomId);
        if (!game) {
            this.sendError(clientId, 'Room not found');
            return;
        }
        try {
            game.skipTurn(clientId);
            const gameState = game.getRoomCopy();
            this.broadcastGameLog(client.roomId, `${client?.name || 'Player'} 抽了一张牌`);
            this.roomManager.broadcastToRoom(client.roomId, {
                type: messages_1.MessageType.GAME_STATE_UPDATED,
                gameState
            });
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    handleCallUno(clientId) {
        const client = this.roomManager.getClient(clientId);
        if (!client || !client.roomId) {
            this.sendError(clientId, 'Not in a room');
            return;
        }
        const game = this.roomManager.getGame(client.roomId);
        if (!game) {
            this.sendError(clientId, 'Room not found');
            return;
        }
        try {
            game.callUno(clientId);
            const gameState = game.getRoomCopy();
            this.broadcastGameLog(client.roomId, `📢 ${client?.name || 'Player'} 喊了 UNO!`);
            this.roomManager.broadcastToRoom(client.roomId, {
                type: messages_1.MessageType.GAME_STATE_UPDATED,
                gameState
            });
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    handleChallengeUno(clientId, targetPlayerId) {
        const client = this.roomManager.getClient(clientId);
        if (!client || !client.roomId) {
            this.sendError(clientId, 'Not in a room');
            return;
        }
        const game = this.roomManager.getGame(client.roomId);
        if (!game) {
            this.sendError(clientId, 'Room not found');
            return;
        }
        try {
            const result = game.challengeUno(clientId, targetPlayerId);
            const gameState = game.getRoomCopy();
            this.roomManager.broadcastToRoom(client.roomId, {
                type: messages_1.MessageType.GAME_STATE_UPDATED,
                gameState,
                challengeResult: {
                    type: 'uno',
                    challengerId: clientId,
                    targetPlayerId,
                    success: result.success,
                    penalty: result.penalty
                }
            });
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    handleChallengeWildDrawFour(clientId, targetPlayerId) {
        const client = this.roomManager.getClient(clientId);
        if (!client || !client.roomId) {
            this.sendError(clientId, 'Not in a room');
            return;
        }
        const game = this.roomManager.getGame(client.roomId);
        if (!game) {
            this.sendError(clientId, 'Room not found');
            return;
        }
        try {
            const result = game.challengeWildDrawFour(clientId, targetPlayerId);
            const gameState = game.getRoomCopy();
            this.roomManager.broadcastToRoom(client.roomId, {
                type: messages_1.MessageType.GAME_STATE_UPDATED,
                gameState,
                challengeResult: {
                    type: 'wild_draw_four',
                    challengerId: clientId,
                    targetPlayerId,
                    success: result.success,
                    penalty: result.penalty
                }
            });
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    handleGetRoomList(clientId) {
        const roomList = this.roomManager.getRoomList();
        this.sendToClient(clientId, {
            type: messages_1.MessageType.ROOM_LIST,
            rooms: roomList
        });
    }
    handleToggleReady(clientId) {
        const client = this.roomManager.getClient(clientId);
        if (!client || !client.roomId) {
            this.sendError(clientId, 'Not in a room');
            return;
        }
        const game = this.roomManager.getGame(client.roomId);
        if (!game) {
            this.sendError(clientId, 'Room not found');
            return;
        }
        try {
            game.toggleReady(clientId);
            const gameState = game.getRoomCopy();
            this.roomManager.broadcastToRoom(client.roomId, {
                type: messages_1.MessageType.GAME_STATE_UPDATED,
                gameState
            });
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    handleRejoinRoom(clientId, roomId, playerName, oldClientId) {
        try {
            const client = this.roomManager.getClient(clientId);
            if (client) {
                client.name = playerName;
            }
            const game = this.roomManager.getGame(roomId);
            if (!game) {
                this.sendError(clientId, 'Room not found');
                return;
            }
            const room = game.getRoom();
            if (room.players.length >= 7) {
                this.sendError(clientId, 'Room is full');
                return;
            }
            // 检查是否是之前的玩家重新加入
            const existingPlayerIndex = room.players.findIndex(p => p.id === oldClientId);
            if (existingPlayerIndex !== -1 && client) {
                // 更新现有玩家的WebSocket连接
                game.updatePlayerConnection(oldClientId, clientId);
                this.roomManager.updatePlayerConnection(oldClientId, clientId, roomId);
                const gameState = game.getRoomCopy();
                this.sendToClient(clientId, {
                    type: messages_1.MessageType.REJOIN_SUCCESS,
                    gameState
                });
                this.roomManager.broadcastToRoom(roomId, {
                    type: messages_1.MessageType.PLAYER_JOINED,
                    playerId: clientId,
                    playerName: client.name,
                    gameState
                }, clientId);
            }
            else if (client) {
                // 新玩家加入
                this.roomManager.joinRoom(clientId, roomId);
                const gameState = game.getRoomCopy();
                this.sendToClient(clientId, {
                    type: messages_1.MessageType.ROOM_JOINED,
                    roomId,
                    gameState
                });
                this.roomManager.broadcastToRoom(roomId, {
                    type: messages_1.MessageType.PLAYER_JOINED,
                    playerId: clientId,
                    playerName: client.name,
                    gameState
                }, clientId);
            }
            this.broadcastRoomList();
        }
        catch (error) {
            this.sendError(clientId, error.message);
        }
    }
    broadcastRoomList() {
        const roomList = this.roomManager.getRoomList();
        const allClients = Array.from(this.roomManager.getClientsInRoom('all'));
        allClients.forEach(client => {
            this.sendToClient(client.id, {
                type: messages_1.MessageType.ROOM_LIST,
                rooms: roomList
            });
        });
    }
    sendToClient(clientId, message) {
        if (typeof clientId === 'string') {
            this.roomManager.sendToClient(clientId, message);
        }
        else {
            clientId.send(JSON.stringify(message));
        }
    }
    sendError(clientId, error) {
        this.sendToClient(clientId, {
            type: messages_1.MessageType.ERROR,
            error
        });
    }
}
exports.UnoServer = UnoServer;
