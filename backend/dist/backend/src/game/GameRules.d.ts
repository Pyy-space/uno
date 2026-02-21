import { Card, CardColor } from '../../../shared/src/types';
export declare class GameRules {
    static canPlayCard(card: Card, topCard: Card, currentColor: CardColor): boolean;
    static canPlayWildDrawFour(card: Card, hand: Card[], currentColor: CardColor): boolean;
    static isSpecialCard(card: Card): boolean;
    static isWildCard(card: Card): boolean;
    static getNextPlayerIndex(currentIndex: number, playerCount: number, direction: number, skip?: boolean): number;
}
