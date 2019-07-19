import { injectable } from "inversify";
import "reflect-metadata";

import { Bitmap } from "./Bitmap/Bitmap";
import { IPixel } from "./Bitmap/IPixel";
import { IBitmapImages } from "./IBitmapImages";

@injectable()
export class DifferenceGeneratorService {

    public generateDifferenceImage(data: IBitmapImages): Bitmap {

        const result: Bitmap = data.originalImage;

        const originalPixels: IPixel[][] = data.originalImage.getPixels();
        const modifiedPixels: IPixel[][] = data.modifiedImage.getPixels();
        const resultPixels: IPixel[][] = [];

        const WHITE_PIXEL: IPixel = { R: 255, G: 255, B: 255 };
        const WIDTH: number = 640;
        const HEIGHT: number = 480;

        for (let i: number = 0; i < WIDTH; i++) {
            resultPixels[i] = new Array<IPixel>(HEIGHT).fill(WHITE_PIXEL);
        }

        for (let i: number = 0; i < WIDTH; i++) {
            for (let j: number = 0; j < HEIGHT; j++) {
                const isEqual: boolean = originalPixels[i][j].B === modifiedPixels[i][j].B &&
                                        originalPixels[i][j].G === modifiedPixels[i][j].G &&
                                        originalPixels[i][j].R === modifiedPixels[i][j].R;
                if (!isEqual) {
                    this.widenPixel(i, j, resultPixels);
                }
            }
        }
        result.setPixels(resultPixels);

        return result;
    }

    private widenPixel(x: number, y: number, result: IPixel[][]): void {

        this.writeBlackPixel(x, y, result);

        const INDEX: number = 3;

        for (let i: number = 1; i <= INDEX; i++) {
            for (let j: number = -1; j <= 1; j++) {
                this.writeBlackPixel(x + i, y + j, result);
                this.writeBlackPixel(x - i, y + j, result);
                this.writeBlackPixel(x + j, y + i, result);
                this.writeBlackPixel(x + j, y - i, result);
            }
        }

        const EDGE: number = 2;

        this.writeBlackPixel(x - EDGE, y - EDGE, result);
        this.writeBlackPixel(x - EDGE, y + EDGE, result);
        this.writeBlackPixel(x + EDGE, y - EDGE, result);
        this.writeBlackPixel(x + EDGE, y + EDGE, result);
    }

    private writeBlackPixel(x: number, y: number, pixels: IPixel[][]): void {
        const BLACK_PIXEL: IPixel = { R: 0, G: 0, B: 0 };
        const WIDTH: number = 640;
        const HEIGHT: number = 480;
        const coordinatesInsideImage: boolean = x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
        if (coordinatesInsideImage) {
            pixels[x][y] = BLACK_PIXEL;
        }
    }

}
