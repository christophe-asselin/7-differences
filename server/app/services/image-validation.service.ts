import { injectable } from "inversify";
import { ICoordinate } from "../../../common/ICoordinate";
import { IDifferenceRegions } from "../../../common/IDifferenceRegions";
import { IImageValidationMessage } from "../../../common/communication/IImageValidationMessage";
import { Title } from "../../../common/communication/TitleEnum";
import { Bitmap } from "./Bitmap/Bitmap";
import { IPixel } from "./Bitmap/IPixel";

@injectable()
export class ImageValidationService {

    private static dx: number[] = [1, 0, -1, -1, -1, 0, 1, 1];
    private static dy: number[] = [-1, -1, -1, 0, 1, 1, 1, 0];
    private static CONNEXITY: number = 8;

    private differenceImage: Bitmap;
    private differenceRegions: IDifferenceRegions;

    public constructor() {
        this.differenceRegions = {
            labels: [],
            regions: [],
        };
    }

    public verifyImageDifference(image: Bitmap): IImageValidationMessage {
        this.differenceImage = image;
        this.initializeDifferenceRegions();

        const CORRECT_NUMBER_OF_DIFFERENCES: number = 7;
        const differences: number = this.countDifferences();

        if (differences === CORRECT_NUMBER_OF_DIFFERENCES) {
            return {
                title: Title.SUCCESS,
                body: "L'image contient 7 différences.",
                differenceRegions: this.differenceRegions.regions,
            };
        } else {
            return {
                title: Title.FAIL,
                body: "L'image contient " + differences + " différence(s), ce qui ne correspond pas à 7.",
            };
        }
    }

    public getDifferenceRegions(): IDifferenceRegions {
        return this.differenceRegions;
    }

    private initializeDifferenceRegions(): void {
        this.differenceRegions = {
            labels: [],
            regions: [],
        };

        for (let i: number = 0; i < this.differenceImage.getWidth(); ++i) {
            this.differenceRegions.labels[i] = new Array<number>(this.differenceImage.getHeight()).fill(0);
        }

        this.differenceRegions.regions[0] = new Array<ICoordinate>();
    }

    private countDifferences(): number {
        let differenceCounter: number = 0;

        for (let y: number = 0; y < this.differenceImage.getHeight(); ++y) {
            for (let x: number = 0; x < this.differenceImage.getWidth(); ++x) {
                const isDifference: boolean = this.pixelIsBlack(x, y) && this.differenceRegions.labels[x][y] === 0;
                if (isDifference) {
                    this.labelRegion(x, y, ++differenceCounter);
                }
            }
        }

        return differenceCounter;
    }

    private labelRegion(x: number, y: number, label: number): void {
        const firstPixel: ICoordinate = { "x": x, "y": y };
        const queue: ICoordinate[] = [];
        queue.push(firstPixel);

        while (queue.length !== 0) {
            const pixel: ICoordinate | undefined = queue.shift();
            if (pixel !== undefined) {
                const pixelHasToBeLabelled: boolean = this.pixelIsWithinBounds(pixel.x, pixel.y) &&
                    this.pixelIsBlack(pixel.x, pixel.y) &&
                    this.differenceRegions.labels[pixel.x][pixel.y] === 0;
                if (pixelHasToBeLabelled) {

                    this.differenceRegions.labels[pixel.x][pixel.y] = label;
                    if (this.differenceRegions.regions[label] == null) {
                        this.differenceRegions.regions[label] = new Array<ICoordinate>();
                    }
                    this.differenceRegions.regions[label].push(pixel);

                    for (let n: number = 0; n < ImageValidationService.CONNEXITY; ++n) {
                        const neighbor: ICoordinate = {
                            x: pixel.x + ImageValidationService.dx[n],
                            y: pixel.y + ImageValidationService.dy[n],
                        };
                        queue.push(neighbor);
                    }
                }
            }
        }
    }

    private pixelIsBlack(x: number, y: number): boolean {
        const pixel: IPixel = this.differenceImage.getPixel(x, y);

        return pixel.R === 0 && pixel.G === 0 && pixel.B === 0;
    }

    private pixelIsWithinBounds(x: number, y: number): boolean {
        return (x >= 0 && x < this.differenceImage.getWidth()) &&
            (y >= 0 && y < this.differenceImage.getHeight());
    }
}
