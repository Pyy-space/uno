import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameRoom, Card } from '../services/websocket';
import { CardType, CardColor, useWebSocket } from '../services/websocket';

export const useGameStore = defineStore('game', () => {
  const ws = useWebSocket();

  const currentRoom = ref<GameRoom | null>(null);
  const roomList = ref<Array<{ id: string; name: string; playerCount: number; state: string }>>([]);
  const isMyTurn = computed(() => {
    if (!currentRoom.value || !ws.getClientId()) return false;
    const currentPlayer = currentRoom.value.players[currentRoom.value.currentPlayerIndex];
    return currentPlayer?.id === ws.getClientId();
  });

  const myPlayer = computed(() => {
    if (!currentRoom.value || !ws.getClientId()) return null;
    return currentRoom.value.players.find((p: any) => p.id === ws.getClientId()) || null;
  });

  const canPlayCard = (card: Card): boolean => {
    if (!currentRoom.value) return false;
    
    const lastPlayedCard = currentRoom.value.lastPlayedCard;
    if (!lastPlayedCard) return false;

    if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR) {
      return true;
    }

    if (card.color === currentRoom.value.currentColor) {
      return true;
    }

    if (card.type === lastPlayedCard.type) {
      if (card.type === CardType.NUMBER) {
        return card.value === lastPlayedCard.value;
      }
      return true;
    }

    return false;
  };

  const getPlayableCards = (hand: Card[]): Card[] => {
    return hand.filter(card => canPlayCard(card));
  };

  const createRoom = (roomName: string, playerName: string) => {
    ws.createRoom(roomName, playerName);
  };

  const joinRoom = (roomId: string, playerName: string) => {
    ws.joinRoom(roomId, playerName);
  };

  const leaveRoom = () => {
    ws.leaveRoom();
  };

  const startGame = () => {
    ws.startGame();
  };

  const playCard = (cardId: string, chosenColor?: CardColor) => {
    ws.playCard(cardId, chosenColor);
  };

  const drawCard = () => {
    ws.drawCard();
  };

  const callUno = () => {
    ws.callUno();
  };

  const challengeUno = () => {
    ws.challengeUno();
  };

  const challengeWildDrawFour = () => {
    ws.challengeDrawFour();
  };

  const getRoomList = () => {
    ws.requestRoomList();
  };

  const toggleReady = () => {
    ws.toggleReady();
  };

  const updateRoom = (room: GameRoom | null) => {
    if (!room) {
      currentRoom.value = null;
    } else {
      currentRoom.value = room;
    }
  };

  const updateRoomList = (rooms: Array<{ id: string; name: string; playerCount: number; state: string }>) => {
    roomList.value = rooms;
  };

  const gameLog = computed(() => ws.getGameLog());

  return {
    currentRoom,
    roomList: roomList,
    isMyTurn,
    myPlayer,
    canPlayCard,
    getPlayableCards,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    playCard,
    drawCard,
    callUno,
    challengeUno,
    challengeWildDrawFour,
    getRoomList,
    toggleReady,
    updateRoom,
    updateRoomList,
    gameLog
  };
});
