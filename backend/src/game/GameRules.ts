import { Card, CardColor, CardType } from '../../../shared/src/types';

export class GameRules {
  static canPlayCard(card: Card, topCard: Card, currentColor: CardColor): boolean {
    if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR) {
      return true;
    }

    if (card.color === currentColor) {
      return true;
    }

    if (card.type === topCard.type) {
      if (card.type === CardType.NUMBER) {
        return card.value === topCard.value;
      }
      return true;
    }

    return false;
  }

  static canPlayWildDrawFour(card: Card, hand: Card[], currentColor: CardColor): boolean {
    if (card.type !== CardType.WILD_DRAW_FOUR) {
      return true;
    }

    const hasMatchingColor = hand.some(c => 
      c.color === currentColor && c.id !== card.id
    );

    return !hasMatchingColor;
  }

  static isSpecialCard(card: Card): boolean {
    return [
      CardType.SKIP,
      CardType.REVERSE,
      CardType.DRAW_TWO,
      CardType.WILD_DRAW_FOUR
    ].includes(card.type);
  }

  static isWildCard(card: Card): boolean {
    return card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR;
  }

  static getNextPlayerIndex(
    currentIndex: number,
    playerCount: number,
    direction: number,
    skip: boolean = false
  ): number {
    let nextIndex = currentIndex + direction;
    if (skip) {
      nextIndex += direction;
    }

    if (nextIndex >= playerCount) {
      nextIndex -= playerCount;
    } else if (nextIndex < 0) {
      nextIndex += playerCount;
    }

    return nextIndex;
  }
}
