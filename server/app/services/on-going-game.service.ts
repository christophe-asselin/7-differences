import { injectable } from "inversify";
import "reflect-metadata";
import { GameType } from "../../../common/GameEnum";
import { IFreeGame } from "../../../common/IFreeGame";
import { ISimpleGame } from "../../../common/ISimpleGame";
import { GameNotFoundError } from "../errors/GameNotFoundError";

@injectable()
export class OnGoingGameService {

    private onGoingSimpleGames: ISimpleGame[];
    private onGoingFreeGames: IFreeGame[];

    public constructor() {
        this.onGoingSimpleGames = [];
        this.onGoingFreeGames = [];
    }

    public getOnGoingGame(id: string, type: GameType): ISimpleGame | IFreeGame {
        return (type === GameType.SIMPLE) ? this.getOnGoingSimpleGame(id) : this.getOnGoingFreeGame(id);
      }

    private getOnGoingSimpleGame(id: string): ISimpleGame {

        const game: ISimpleGame | undefined = this.onGoingSimpleGames.find((aGame: ISimpleGame) => aGame._id === id);
        if (game) {
            return game;
        } else {
            throw new GameNotFoundError("Simple game is not found in OnGoingSimpleGames");
        }

    }

    private getOnGoingFreeGame(id: string): IFreeGame {
        const game: IFreeGame | undefined = this.onGoingFreeGames.find((aGame: IFreeGame) => aGame._id === id);
        if (game !== undefined) {
            return game;
        } else {
            throw new GameNotFoundError("Free game is not found in OnGoingFreeGames");
        }
    }

    public addOnGoingGame(game: ISimpleGame | IFreeGame): void {
        game.type === GameType.SIMPLE ? this.onGoingSimpleGames.push(game as ISimpleGame) : this.onGoingFreeGames.push(game as IFreeGame);
    }

    public removeOnGoingGame(id: string, type: GameType): void {
        if (type === GameType.SIMPLE) {
            const indexSimple: number = this.onGoingSimpleGames.findIndex((game: ISimpleGame) => game._id === id);
            this.onGoingSimpleGames.splice(indexSimple, 1);
        } else {
            const indexFree: number = this.onGoingFreeGames.findIndex((game: IFreeGame) => game._id === id);
            this.onGoingFreeGames.splice(indexFree, 1);
        }
    }

}
