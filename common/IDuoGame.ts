import { IDuoPlayer } from "./IDuoPlayer";

export interface IDuoGame {
    idDuo: number;
    idGame: string;
    duoPlayers: IDuoPlayer[];
    modifiedImageURL?: string;
    object3DIndex?: number;
    identifiedDifferences?: boolean[][];
}