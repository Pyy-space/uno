"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardFactory = void 0;
const types_1 = require("../../../shared/src/types");
const constants_1 = require("../../../shared/src/constants");
class CardFactory {
    static generateId() {
        return `card_${++this.idCounter}_${Date.now()}`;
    }
    static createDeck() {
        const deck = [];
        constants_1.CARD_COLORS.forEach(color => {
            constants_1.CARD_NUMBERS.forEach(number => {
                const count = number === 0 ? 1 : 2;
                for (let i = 0; i < count; i++) {
                    deck.push({
                        id: this.generateId(),
                        color: color,
                        type: types_1.CardType.NUMBER,
                        value: number
                    });
                }
            });
        });
        constants_1.CARD_COLORS.forEach(color => {
            [types_1.CardType.SKIP, types_1.CardType.REVERSE, types_1.CardType.DRAW_TWO].forEach(type => {
                for (let i = 0; i < 2; i++) {
                    deck.push({
                        id: this.generateId(),
                        color: color,
                        type
                    });
                }
            });
        });
        for (let i = 0; i < 4; i++) {
            deck.push({
                id: this.generateId(),
                color: types_1.CardColor.WILD,
                type: types_1.CardType.WILD
            });
        }
        for (let i = 0; i < 4; i++) {
            deck.push({
                id: this.generateId(),
                color: types_1.CardColor.WILD,
                type: types_1.CardType.WILD_DRAW_FOUR
            });
        }
        return this.shuffle(deck);
    }
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
exports.CardFactory = CardFactory;
CardFactory.idCounter = 0;
