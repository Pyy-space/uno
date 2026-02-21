import { GameRoom, Player, Card, CardColor } from '../../../shared/src/types';
export declare class UnoGame {
    private room;
    constructor(roomId: string, roomName: string);
    addPlayer(playerId: string, playerName: string): void;
    toggleReady(playerId: string): void;
    removePlayer(playerId: string): void;
    startGame(): void;
    playCard(playerId: string, cardId: string, chosenColor?: CardColor): void;
    drawCard(): Card | null;
    drawCards(player: Player, count: number): void;
    skipTurn(playerId: string): void;
    callUno(playerId: string): void;
    challengeUno(playerId: string, targetPlayerId: string): {
        success: boolean;
        penalty: number;
    };
    challengeWildDrawFour(playerId: string, targetPlayerId: string): {
        success: boolean;
        penalty: number;
    };
    private handleSpecialCard;
    private nextTurn;
    private getCurrentPlayer;
    getRoom(): GameRoom;
    getRoomCopy(): GameRoom;
    getPlayerIdByClientId(clientId: string): string;
    updatePlayerConnection(oldClientId: string, newClientId: string): void;
}
