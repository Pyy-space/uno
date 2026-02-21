import { Card } from '../../../shared/src/types';
export declare class CardFactory {
    private static idCounter;
    static generateId(): string;
    static createDeck(): Card[];
    static shuffle<T>(array: T[]): T[];
}
