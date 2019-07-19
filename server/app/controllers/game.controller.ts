import { NextFunction, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import Types from "../types";

import { GameMode } from "../../../common/GameEnum";
import { IDuoGame } from "../../../common/IDuoGame";
import { IFreeGame } from "../../../common/IFreeGame";
import { ISimpleGame } from "../../../common/ISimpleGame";
import { DuoGameService } from "../services/duo-game.service";
import { GameService } from "../services/game.service";
import { OnGoingGameService } from "../services/on-going-game.service";

@injectable()
export class GameController {

    public constructor(@inject(Types.GameService) private gameService: GameService,
                       @inject(Types.DuoGameService) private duoGameService: DuoGameService,
                       @inject(Types.OnGoingGameService) private onGoingGameService: OnGoingGameService) { }

    public get router(): Router {
        const router: Router = Router();

        router.get("/games/:type", (req: Request, res: Response, next: NextFunction) => {
            this.gameService.getGames(req.params.type).then((games: ISimpleGame[] | IFreeGame[]) => {
                res.json(games);
            }).catch(() => {
                res.json([]);
            });
         });

        router.get("/games/:type/:nPlayers/:id", (req: Request, res: Response, next: NextFunction) => {
            if (req.params.nPlayers === GameMode.SOLO) {
                this.gameService.getGame(req.params.id, req.params.type).then((game: ISimpleGame | IFreeGame) => {
                    res.json(game);
                }).catch((err: Error) => {
                    res.json(err.message);
                });
            } else { /* get onGoingGame */
                try {
                    const game: ISimpleGame | IFreeGame = this.onGoingGameService.getOnGoingGame(req.params.id, req.params.type);
                    res.json(game);
                } catch (err) {
                    res.json(err.message);
                }
            }
        });

        router.get("/duoGames/:username", (req: Request, res: Response, next: NextFunction) => {
            const game: IDuoGame = this.duoGameService.getDuoGame(req.params.username);
            res.json(game);
        });

        return router;
    }
}
