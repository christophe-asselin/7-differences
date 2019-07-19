import { GameType } from "./GameEnum";

export interface IModificationGameData<T> {
    _id: string,
    type: GameType,
    data: T,
}