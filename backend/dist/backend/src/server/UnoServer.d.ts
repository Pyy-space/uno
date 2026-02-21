export declare class UnoServer {
    private wss;
    private roomManager;
    constructor(port?: number);
    private startCleanup;
    private setupServer;
    private handleMessage;
    private handleCreateRoom;
    private handleJoinRoom;
    private handleLeaveRoom;
    private handleStartGame;
    private broadcastGameLog;
    private handlePlayCard;
    private handleDrawCard;
    private handleCallUno;
    private handleChallengeUno;
    private handleChallengeWildDrawFour;
    private handleGetRoomList;
    private handleToggleReady;
    private handleRejoinRoom;
    private broadcastRoomList;
    private sendToClient;
    private sendError;
}
