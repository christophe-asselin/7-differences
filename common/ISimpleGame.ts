import { IScore } from "./IScore";
import { GameType, GameState } from "./GameEnum";
import { ICoordinate } from "./ICoordinate";

export interface ISimpleGame {
    _id: string;
    name: string;
    type: GameType;
    originalImageURL: string;
    modifiedImageURL: string;
    differenceRegions: ICoordinate[][];
    scoreSolo: IScore[];
    scoreDuo: IScore[];
    state: GameState;
}
