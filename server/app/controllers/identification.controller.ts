import { NextFunction, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { GameType } from "../../../common/GameEnum";
import { IFreeGame } from "../../../common/IFreeGame";
import { ISimpleGame } from "../../../common/ISimpleGame";
import { Title } from "../../../common/communication/TitleEnum";
import { ISimpleIdentification } from "../services/ISimpleIdentification";
import { IdentificationService } from "../services/identification.service";
import { Identification3DService } from "../services/identification3D.service";
import { OnGoingGameService } from "../services/on-going-game.service";
import Types from "../types";

@injectable()
export class IdentificationController {

    public constructor(@inject(Types.IdentificationService) private identificationService: IdentificationService,
                       @inject(Types.Identification3DService) private identification3DService: Identification3DService,
                       @inject(Types.OnGoingGameService) private onGoingGameService: OnGoingGameService) { }

    public get router(): Router {
        const router: Router = Router();

        router.post("/simple/:gameID/:x/:y", (req: Request, res: Response, next: NextFunction) => {
            const data: ISimpleIdentification = this.identificationService.getData(req);
            try {
                const simpleGame: ISimpleGame = this.onGoingGameService.getOnGoingGame(req.params.gameID, GameType.SIMPLE) as ISimpleGame;
                res.json(this.identificationService.generateResponse(data, simpleGame.differenceRegions));
            } catch (err) {
                res.json({
                    title: Title.FAIL,
                    differenceIdentified: false,
                });
            }
        });

        router.get("/free/:gameID/:index", (req: Request, res: Response, next: NextFunction) => {
            try {
                const freeGame: IFreeGame = this.onGoingGameService.getOnGoingGame(req.params.gameID, GameType.FREE) as IFreeGame;
                const isDifference: boolean = this.identification3DService.generateResponse(freeGame, req.params.index);
                res.json(isDifference);
            } catch (err) {
                res.json(false);
            }
        });

        return router;
    }
}
