import { GameEvent, RankingString, GameMode } from "./GameEnum";

export interface IGameMessage {
    username?: string;
    event?: GameEvent;
    gameName?: string;
    nPlayers?: GameMode;
    position?: RankingString;
}