export enum MessageType {
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  START_GAME = 'start_game',
  PLAY_CARD = 'play_card',
  DRAW_CARD = 'draw_card',
  CALL_UNO = 'call_uno',
  CHALLENGE_UNO = 'challenge_uno',
  CHALLENGE_WILD_DRAW_FOUR = 'challenge_wild_draw_four',
  GET_ROOM_LIST = 'get_room_list',
  TOGGLE_READY = 'toggle_ready',
  ROOM_CREATED = 'room_created',
  ROOM_JOINED = 'room_joined',
  ROOM_LEFT = 'room_left',
  GAME_STARTED = 'game_started',
  GAME_STATE_UPDATED = 'game_state_updated',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  ERROR = 'error',
  ROOM_LIST = 'room_list'
}

export interface CreateRoomMessage {
  type: MessageType.CREATE_ROOM;
  roomName: string;
}

export interface JoinRoomMessage {
  type: MessageType.JOIN_ROOM;
  roomId: string;
}

export interface LeaveRoomMessage {
  type: MessageType.LEAVE_ROOM;
}

export interface StartGameMessage {
  type: MessageType.START_GAME;
}

export interface PlayCardMessage {
  type: MessageType.PLAY_CARD;
  cardId: string;
  chosenColor?: string;
}

export interface DrawCardMessage {
  type: MessageType.DRAW_CARD;
}

export interface CallUnoMessage {
  type: MessageType.CALL_UNO;
}

export interface ChallengeUnoMessage {
  type: MessageType.CHALLENGE_UNO;
  targetPlayerId: string;
}

export interface ChallengeWildDrawFourMessage {
  type: MessageType.CHALLENGE_WILD_DRAW_FOUR;
  targetPlayerId: string;
}

export interface GetRoomListMessage {
  type: MessageType.GET_ROOM_LIST;
}
