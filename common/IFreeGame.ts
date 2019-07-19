import { IScore } from "./IScore";
import { GameType, GameState } from "./GameEnum";
import { IObject3D } from "./IObject3D";
import { IObject3DTheme } from "./IObject3DTheme";
import { Game3DType } from "./Game3DType";

export interface IFreeGame {
    _id: string;
    name: string;
    type: GameType;
    game3Dtype: Game3DType;
    originalImageURL: string;
    scoreSolo: IScore[];
    scoreDuo: IScore[];
    originalObjects: IObject3D[] | IObject3DTheme[];
    modifiedObjects: IObject3D[] | IObject3DTheme[];
    state: GameState;
}
