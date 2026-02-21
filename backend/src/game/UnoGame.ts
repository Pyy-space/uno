import { v4 as uuidv4 } from 'uuid';
import { GameRoom, Player, Card, CardColor, CardType, GameDirection, GameState, PlayerRanking } from '../../../shared/src/types';
import { INITIAL_HAND_SIZE } from '../../../shared/src/constants';
import { CardFactory } from './CardFactory';
import { GameRules } from './GameRules';

export class UnoGame {
  private room: GameRoom;

  constructor(roomId: string, roomName: string) {
    this.room = {
      id: roomId,
      name: roomName,
      players: [],
      currentPlayerIndex: 0,
      direction: GameDirection.CLOCKWISE,
      drawPile: [],
      discardPile: [],
      state: GameState.WAITING,
      currentColor: CardColor.RED,
      accumulatedDraw: 0,
      lastPlayedCard: null,
      winner: null,
      rankings: [],
      history: [],
      createdAt: new Date()
    };
  }

  addPlayer(playerId: string, playerName: string): void {
    if (this.room.players.length >= 7) {
      throw new Error('房间已满');
    }

    const player: Player = {
      id: playerId,
      name: playerName,
      hand: [],
      isUnoCalled: false,
      isReady: false
    };

    this.room.players.push(player);
  }

  toggleReady(playerId: string): void {
    const player = this.room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = !player.isReady;
      
      if (this.room.state === GameState.WAITING) {
        const allReady = this.room.players.every(p => p.isReady);
        if (allReady && this.room.players.length >= 2) {
          this.startGame();
        }
      }
    }
  }

  removePlayer(playerId: string): void {
    this.room.players = this.room.players.filter(p => p.id !== playerId);
    
    if (this.room.players.length < 2 && this.room.state === GameState.PLAYING) {
      this.room.state = GameState.FINISHED;
      this.room.winner = this.room.players[0] || null;
    }
  }

  startGame(): void {
    if (this.room.players.length < 2) {
      throw new Error('至少需要2名玩家才能开始游戏');
    }

    this.room.drawPile = CardFactory.createDeck();
    this.room.discardPile = [];
    this.room.accumulatedDraw = 0;
    this.room.currentPlayerIndex = 0;
    this.room.direction = GameDirection.CLOCKWISE;
    this.room.state = GameState.PLAYING;
    this.room.currentColor = CardColor.WILD; // 初始颜色设为万能，让第一个玩家决定
    this.room.winner = null;
    this.room.rankings = [];

    this.room.players.forEach(player => {
      player.hand = [];
      for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
        player.hand.push(this.drawCard()!);
      }
      player.isUnoCalled = false;
    });

    // 不设置初始牌，让第一个玩家出牌
    this.room.lastPlayedCard = null;
  }

  playCard(playerId: string, cardId: string, chosenColor?: CardColor): void {
    if (this.room.state !== GameState.PLAYING) {
      throw new Error('游戏未开始或已结束');
    }

    const player = this.getCurrentPlayer();
    if (player.id !== playerId) {
      throw new Error('不是你的回合');
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('你没有这张牌');
    }

    const card = player.hand[cardIndex];

    // 游戏开始时（没有lastPlayedCard），允许玩家出任意牌
    if (this.room.lastPlayedCard && !GameRules.canPlayCard(card, this.room.lastPlayedCard, this.room.currentColor)) {
      throw new Error('不能出这张牌');
    }

    if (GameRules.isWildCard(card) && !chosenColor) {
      throw new Error('万能牌必须选择颜色');
    }

    player.hand.splice(cardIndex, 1);
    this.room.discardPile.push(card);
    this.room.lastPlayedCard = card;

    if (GameRules.isWildCard(card)) {
      this.room.currentColor = chosenColor!;
    } else {
      this.room.currentColor = card.color;
    }

    if (player.hand.length === 1 && !player.isUnoCalled) {
      this.drawCards(player, 2);
    }

    if (player.hand.length === 0) {
      const ranking: PlayerRanking = {
        playerId: player.id,
        playerName: player.name,
        rank: this.room.rankings.length + 1,
        finishedAt: new Date()
      };
      this.room.rankings.push(ranking);
      
      if (this.room.rankings.length >= this.room.players.length - 1) {
        const lastPlayer = this.room.players.find(p => !this.room.rankings.find(r => r.playerId === p.id));
        if (lastPlayer) {
          const lastRanking: PlayerRanking = {
            playerId: lastPlayer.id,
            playerName: lastPlayer.name,
            rank: this.room.players.length,
            finishedAt: new Date()
          };
          this.room.rankings.push(lastRanking);
        }
        this.room.winner = this.room.players.find(p => p.id === this.room.rankings[0]?.playerId) || null;
        this.room.state = GameState.FINISHED;
        return;
      }
      
      this.nextTurn();
      return;
    }

    player.isUnoCalled = false;

    this.handleSpecialCard(card);
  }

  drawCard(): Card | null {
    if (this.room.drawPile.length === 0) {
      if (this.room.discardPile.length <= 1) {
        return null;
      }
      const topCard = this.room.discardPile.pop()!;
      this.room.drawPile = CardFactory.shuffle(this.room.discardPile);
      this.room.discardPile = [topCard];
    }

    return this.room.drawPile.pop()!;
  }

  drawCards(player: Player, count: number): void {
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      if (card) {
        player.hand.push(card);
      }
    }
  }

  skipTurn(playerId: string): void {
    if (this.room.state !== GameState.PLAYING) {
      throw new Error('游戏未开始或已结束');
    }

    const player = this.getCurrentPlayer();
    if (player.id !== playerId) {
      throw new Error('不是你的回合');
    }

    if (this.room.accumulatedDraw > 0) {
      this.drawCards(player, this.room.accumulatedDraw);
      this.room.accumulatedDraw = 0;
    } else {
      const card = this.drawCard();
      if (card && GameRules.canPlayCard(card, this.room.lastPlayedCard!, this.room.currentColor)) {
        player.hand.push(card);
        return;
      }
      if (card) {
        player.hand.push(card);
      }
    }

    this.nextTurn();
  }

  callUno(playerId: string): void {
    const player = this.room.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('玩家不存在');
    }

    if (player.hand.length !== 1) {
      throw new Error('只有剩一张牌时才能喊UNO');
    }

    player.isUnoCalled = true;
  }

  challengeUno(playerId: string, targetPlayerId: string): { success: boolean; penalty: number } {
    const challenger = this.room.players.find(p => p.id === playerId);
    const target = this.room.players.find(p => p.id === targetPlayerId);

    if (!challenger || !target) {
      throw new Error('玩家不存在');
    }

    if (target.hand.length !== 1 || target.isUnoCalled) {
      this.drawCards(challenger, 2);
      return { success: false, penalty: 2 };
    }

    this.drawCards(target, 2);
    return { success: true, penalty: 2 };
  }

  challengeWildDrawFour(playerId: string, targetPlayerId: string): { success: boolean; penalty: number } {
    const challenger = this.room.players.find(p => p.id === playerId);
    const target = this.room.players.find(p => p.id === targetPlayerId);

    if (!challenger || !target) {
      throw new Error('玩家不存在');
    }

    const lastCard = this.room.lastPlayedCard!;
    const previousColor = this.room.currentColor;

    const isLegal = GameRules.canPlayWildDrawFour(lastCard, target.hand, previousColor);

    if (isLegal) {
      this.drawCards(challenger, 6);
      this.nextTurn();
      return { success: false, penalty: 6 };
    } else {
      this.drawCards(target, 4);
      challenger.hand.push(...target.hand.filter(c => c.id !== lastCard.id));
      target.hand = target.hand.filter(c => c.id === lastCard.id);
      return { success: true, penalty: 4 };
    }
  }

  private handleSpecialCard(card: Card): void {
    let skip = false;
    let draw = 0;

    switch (card.type) {
      case CardType.SKIP:
        skip = true;
        break;
      case CardType.REVERSE:
        if (this.room.players.length === 2) {
          skip = true;
        } else {
          this.room.direction *= -1 as GameDirection;
        }
        break;
      case CardType.DRAW_TWO:
        draw = 2;
        break;
      case CardType.WILD_DRAW_FOUR:
        draw = 4;
        break;
    }

    if (draw > 0) {
      this.room.accumulatedDraw += draw;
    }

    this.nextTurn(skip);
  }

  private nextTurn(skip: boolean = false): void {
    this.room.currentPlayerIndex = GameRules.getNextPlayerIndex(
      this.room.currentPlayerIndex,
      this.room.players.length,
      this.room.direction,
      skip
    );
  }

  private getCurrentPlayer(): Player {
    return this.room.players[this.room.currentPlayerIndex];
  }

  getRoom(): GameRoom {
    return { ...this.room };
  }

  getRoomCopy(): GameRoom {
    return JSON.parse(JSON.stringify(this.room));
  }

  getPlayerIdByClientId(clientId: string): string {
    const player = this.room.players.find(p => p.id === clientId);
    if (!player) {
      throw new Error('玩家不存在');
    }
    return player.id;
  }

  updatePlayerConnection(oldClientId: string, newClientId: string): void {
    const player = this.room.players.find(p => p.id === oldClientId);
    if (player) {
      player.id = newClientId;
    }
  }
}
