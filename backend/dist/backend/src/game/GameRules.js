"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRules = void 0;
const types_1 = require("../../../shared/src/types");
class GameRules {
    static canPlayCard(card, topCard, currentColor) {
        if (card.type === types_1.CardType.WILD || card.type === types_1.CardType.WILD_DRAW_FOUR) {
            return true;
        }
        if (card.color === currentColor) {
            return true;
        }
        if (card.type === topCard.type) {
            if (card.type === types_1.CardType.NUMBER) {
                return card.value === topCard.value;
            }
            return true;
        }
        return false;
    }
    static canPlayWildDrawFour(card, hand, currentColor) {
        if (card.type !== types_1.CardType.WILD_DRAW_FOUR) {
            return true;
        }
        const hasMatchingColor = hand.some(c => c.color === currentColor && c.id !== card.id);
        return !hasMatchingColor;
    }
    static isSpecialCard(card) {
        return [
            types_1.CardType.SKIP,
            types_1.CardType.REVERSE,
            types_1.CardType.DRAW_TWO,
            types_1.CardType.WILD_DRAW_FOUR
        ].includes(card.type);
    }
    static isWildCard(card) {
        return card.type === types_1.CardType.WILD || card.type === types_1.CardType.WILD_DRAW_FOUR;
    }
    static getNextPlayerIndex(currentIndex, playerCount, direction, skip = false) {
        let nextIndex = currentIndex + direction;
        if (skip) {
            nextIndex += direction;
        }
        if (nextIndex >= playerCount) {
            nextIndex -= playerCount;
        }
        else if (nextIndex < 0) {
            nextIndex += playerCount;
        }
        return nextIndex;
    }
}
exports.GameRules = GameRules;
