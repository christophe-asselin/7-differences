import { Request } from "express";
import { inject, injectable } from "inversify";
import { IImageValidationMessage } from "../../../common/communication/IImageValidationMessage";
import { RequestFormatError } from "../errors/RequestFormatError";
import Types from "../types";
import { Bitmap } from "./Bitmap/Bitmap";
import { IBitmapImages } from "./IBitmapImages";
import { DifferenceGeneratorService } from "./difference-generator.service";
import { ImageValidationService } from "./image-validation.service";

@injectable()
export class ImageService {

    private differenceImage: Bitmap;

    public constructor(@inject(Types.DifferenceGeneratorService) private differenceGeneratorService: DifferenceGeneratorService,
                       @inject(Types.ImageValidationService) private imageValidationService: ImageValidationService) { }

    public getData(req: Request): IBitmapImages {

        let originalImageBuffer: Buffer;
        let modifiedImageBuffer: Buffer;

        try {
            originalImageBuffer = req.files["originalImage"][0].buffer;
            modifiedImageBuffer = req.files["modifiedImage"][0].buffer;
        } catch (err) {
            throw new RequestFormatError(err.message);
        }

        const originalImage: Bitmap = new Bitmap(originalImageBuffer);
        const modifiedImage: Bitmap = new Bitmap(modifiedImageBuffer);

        return {
            originalImage: originalImage,
            modifiedImage: modifiedImage,
        };
    }

    public async verifyImage(data: IBitmapImages): Promise<IImageValidationMessage> {
        this.differenceImage = this.differenceGeneratorService.generateDifferenceImage(data);

        return this.imageValidationService.verifyImageDifference(this.differenceImage);

    }

}
