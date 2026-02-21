"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.GameDirection = exports.CardType = exports.CardColor = void 0;
var CardColor;
(function (CardColor) {
    CardColor["RED"] = "red";
    CardColor["YELLOW"] = "yellow";
    CardColor["GREEN"] = "green";
    CardColor["BLUE"] = "blue";
    CardColor["WILD"] = "wild";
})(CardColor || (exports.CardColor = CardColor = {}));
var CardType;
(function (CardType) {
    CardType["NUMBER"] = "number";
    CardType["SKIP"] = "skip";
    CardType["REVERSE"] = "reverse";
    CardType["DRAW_TWO"] = "draw_two";
    CardType["WILD"] = "wild";
    CardType["WILD_DRAW_FOUR"] = "wild_draw_four";
})(CardType || (exports.CardType = CardType = {}));
var GameDirection;
(function (GameDirection) {
    GameDirection[GameDirection["CLOCKWISE"] = 1] = "CLOCKWISE";
    GameDirection[GameDirection["COUNTER_CLOCKWISE"] = -1] = "COUNTER_CLOCKWISE";
})(GameDirection || (exports.GameDirection = GameDirection = {}));
var GameState;
(function (GameState) {
    GameState["WAITING"] = "waiting";
    GameState["PLAYING"] = "playing";
    GameState["FINISHED"] = "finished";
})(GameState || (exports.GameState = GameState = {}));
