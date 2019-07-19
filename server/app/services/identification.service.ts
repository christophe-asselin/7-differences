import { Request } from "express";
import { injectable } from "inversify";
import "reflect-metadata";
import { ICoordinate } from "../../../common/ICoordinate";
import { IDifferenceIdentificationMessage } from "../../../common/communication/IDifferenceIdentificationMessage";
import { Title } from "../../../common/communication/TitleEnum";

import { RequestFormatError } from "../errors/RequestFormatError";
import { Bitmap } from "./Bitmap/Bitmap";
import { IPixel } from "./Bitmap/IPixel";
import { ISimpleIdentification } from "./ISimpleIdentification";

@injectable()
export class IdentificationService {

    public getData(req: Request): ISimpleIdentification {
        let coordinate: ICoordinate;
        let originalImage: Bitmap;
        let modifiedImage: Bitmap;
        try {
            coordinate = {x: req.params.x, y: req.params.y};
            originalImage = new Bitmap(req.files["originalImage"][0].buffer);
            modifiedImage = new Bitmap(req.files["modifiedImage"][0].buffer);
        } catch (err) {
            throw new RequestFormatError(err.message);
        }

        return {
            coordinate: coordinate,
            originalImage: originalImage,
            modifiedImage: modifiedImage,
        };
    }

    public generateResponse(data: ISimpleIdentification, differenceRegions: ICoordinate[][]): IDifferenceIdentificationMessage {
        const clickCoordinates: ICoordinate = { x: data.coordinate.x, y: data.coordinate.y};
        const region: ICoordinate[] = this.verifyPosition(differenceRegions, clickCoordinates);
        if (region.length !== 0) {
            const newModifiedURL: string = this.replacePixels(region, data);

            return {
                title: Title.SUCCESS,
                coordinates: region,
                differenceIdentified: true,
                newModifiedImageURL: newModifiedURL,
            };
        } else {
            return {
                title: Title.SUCCESS,
                differenceIdentified: false,
            };
        }

    }

    public verifyPosition(differenceRegions: ICoordinate[][], clickPosition: ICoordinate): ICoordinate[] {
        let i: number = 1;
        while (differenceRegions[i] !== undefined) {
            for (const coordinate of differenceRegions[i]) {
                const areEqual: boolean = (coordinate.x === +clickPosition.x && coordinate.y === +clickPosition.y);
                if (areEqual) {
                    return differenceRegions[i];
                }
            }
            ++i;
        }

        return differenceRegions[0];
    }

    public replacePixels(region: ICoordinate[], data: ISimpleIdentification): string {

        const originalImage: Bitmap = data.originalImage;
        const modifiedImage: Bitmap = data.modifiedImage;

        for (const coord of region) {
            const originalPixel: IPixel = originalImage.getPixel(coord.x, coord.y);
            modifiedImage.setPixel(coord.x, coord.y, originalPixel);
        }

        return "data:image/bmp;base64," + modifiedImage.toBuffer().toString("base64");
    }
}
