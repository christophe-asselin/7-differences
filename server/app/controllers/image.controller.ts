import { NextFunction, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";

import { IImageValidationMessage } from "../../../common/communication/IImageValidationMessage";
import { Title } from "../../../common/communication/TitleEnum";
import { IBitmapImages } from "../services/IBitmapImages";
import { ImageService } from "../services/image.service";
import Types from "../types";

@injectable()
export class ImageController {

    private static readonly BAD_REQUEST: number = 400;
    private static readonly INTERNAL_ERROR: number = 500;

    public constructor(@inject(Types.ImageService) private imageService: ImageService) { }

    public get router(): Router {
        const router: Router = Router();

        router.post("/", async (req: Request, res: Response, next: NextFunction) => {
            if (!req.body) {
                res.sendStatus(ImageController.BAD_REQUEST);
            } else {
                try {
                    const data: IBitmapImages = this.imageService.getData(req);
                    this.imageService.verifyImage(data).then((message: IImageValidationMessage) => {
                        res.json(message);
                    }).catch((err: Error) => {
                        res.json({ title: Title.FAIL, body: err.message }).status(ImageController.INTERNAL_ERROR);
                    });
                } catch (err) {
                    res.json({ title: Title.FAIL, body: err.message }).status(ImageController.BAD_REQUEST);
                }
            }
        });

        return router;
    }
}
