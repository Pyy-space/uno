import { Card, CardColor, CardType } from '../../../shared/src/types';
import { CARD_COLORS, CARD_NUMBERS } from '../../../shared/src/constants';

export class CardFactory {
  private static idCounter = 0;

  static generateId(): string {
    return `card_${++this.idCounter}_${Date.now()}`;
  }

  static createDeck(): Card[] {
    const deck: Card[] = [];

    CARD_COLORS.forEach(color => {
      CARD_NUMBERS.forEach(number => {
        const count = number === 0 ? 1 : 2;
        for (let i = 0; i < count; i++) {
          deck.push({
            id: this.generateId(),
            color: color as CardColor,
            type: CardType.NUMBER,
            value: number
          });
        }
      });
    });

    CARD_COLORS.forEach(color => {
      [CardType.SKIP, CardType.REVERSE, CardType.DRAW_TWO].forEach(type => {
        for (let i = 0; i < 2; i++) {
          deck.push({
            id: this.generateId(),
            color: color as CardColor,
            type
          });
        }
      });
    });

    for (let i = 0; i < 4; i++) {
      deck.push({
        id: this.generateId(),
        color: CardColor.WILD,
        type: CardType.WILD
      });
    }

    for (let i = 0; i < 4; i++) {
      deck.push({
        id: this.generateId(),
        color: CardColor.WILD,
        type: CardType.WILD_DRAW_FOUR
      });
    }

    return this.shuffle(deck);
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
