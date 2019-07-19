export enum GameEvent {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    DIFFERENCE_FOUND = "difference_found",
    ERROR_IDENTIFICATION = "error",
    BEST_SCORE = "best_score",
}

export enum GameMode {
    SOLO = "solo",
    DUO = "duo"
}

export enum GameType {
    SIMPLE = "simple",
    FREE = "free"
}

export enum GameState {
    WAITING = "waiting",
    NOT_WAITING = "notWaiting",
}

export enum RankingString {
    FIRST = "première",
    SECOND = "deuxième",
    THIRD = "troisième",
    NONE = "",
}

export enum RankingNumber {
    FIRST = 0,
    SECOND = 1,
    THIRD = 2,
}