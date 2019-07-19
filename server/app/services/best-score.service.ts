import { inject, injectable } from "inversify";
import "reflect-metadata";
import Types from "../types";

import { GameEvent, GameMode, GameType, RankingNumber, RankingString } from "../../../common/GameEnum";
import { IFreeGame } from "../../../common/IFreeGame";
import { IGameMessage } from "../../../common/IGameMessage";
import { IScore } from "../../../common/IScore";
import { ISimpleGame } from "../../../common/ISimpleGame";
import { GameService } from "./game.service";
import { OnGoingGameService } from "./on-going-game.service";

@injectable()
export class BestScoreService {

    public scores: IScore[];

    public constructor(@inject(Types.GameService) private gameService: GameService,
                       @inject(Types.OnGoingGameService) private onGoingGameService: OnGoingGameService) {
        this.scores = [];
    }

    public static generateRandomScore(): IScore[] {
        const NAMES: string[] = ["Lévis", "Michel", "Nikolay", "Olivier", "Wassim",
                                 "Anes", "Adem", "David", "Christophe", "Grégoire",
                                 "Maude", "Roger", "Agathe", "Thomas"];

        const N_SCORES: number = 3;
        const MINUTES_BOUNDS: number = 20;
        const SECONDS_BOUNDS: number = 60;
        const scores: IScore[] = [];

        for (let i: number = 0; i < N_SCORES; i++) {
            const randomMinutes: string = Math.floor((Math.random() * MINUTES_BOUNDS) + MINUTES_BOUNDS).toString();
            const randomSeconds: string = Math.floor((Math.random() * SECONDS_BOUNDS))
                .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
            scores.push({
                time: randomMinutes + ":" + randomSeconds,
                name: NAMES[Math.floor(Math.random() * NAMES.length)],
            });
        }

        return this.sortScore(scores);
    }

    public static sortScore(myScore: IScore[]): IScore[] {
        const NB_CARACTER: number = 2;
        const INDEX: number = 3;

        myScore.sort((n1: IScore, n2: IScore) => {
            if (+n1.time.substr(0, NB_CARACTER) > +n2.time.substr(0, NB_CARACTER)) {
                return 1;
            } else if (+n1.time.substr(0, NB_CARACTER) < +n2.time.substr(0, NB_CARACTER)) {
                return -1;
            } else {
                return +n1.time.substr(INDEX, NB_CARACTER) > +n2.time.substr(INDEX, NB_CARACTER) ? 1 : 0;
            }
        });

        while (myScore.length > INDEX) {
            myScore.pop();
        }

        return myScore;
    }

    public async updateScores(idGame: string, type: GameType, nPlayers: GameMode, timeString: string, username: string)
        : Promise<IGameMessage> {
        return new Promise<IGameMessage>((resolve: (value: IGameMessage) => void) => {
            const game: ISimpleGame | IFreeGame = this.onGoingGameService.getOnGoingGame(idGame, type);
            this.scores = (nPlayers === GameMode.SOLO) ? game.scoreSolo : game.scoreDuo;

            this.insertNewScore(timeString, username);
            const position: number = this.getPosition(username);
            const message: IGameMessage = {
                username: username,
                event: GameEvent.BEST_SCORE,
                gameName: game.name,
                nPlayers: nPlayers,
                position: RankingString.NONE,
            };
            if (position !== -1) {
                this.gameService.setScores(game, nPlayers, this.scores).then(() => {
                    message.position = this.positionToString(position);
                    resolve(message);
                }).catch(() => () => {
                    resolve(message);
                });
            }
        });
    }

    private insertNewScore(time: string, username: string): void {
        this.scores.push({ time: time, name: username });
        this.scores = BestScoreService.sortScore(this.scores);
    }

    private getPosition(username: string): number {
        return this.scores.findIndex((score: IScore) => score.name === username);
    }

    private positionToString(position: number): RankingString {
        let positionString: RankingString = RankingString.NONE;
        switch (position) {
            case RankingNumber.FIRST:
                positionString = RankingString.FIRST;
                break;
            case RankingNumber.SECOND:
                positionString = RankingString.SECOND;
                break;
            case RankingNumber.THIRD:
                positionString = RankingString.THIRD;
                break;
            default: break;
        }

        return positionString;

    }

}
