import { expect } from "chai";
import { readFileSync } from "fs";
import { ICoordinate } from "../../../common/ICoordinate";
import { IDifferenceRegions } from "../../../common/IDifferenceRegions";
import { IDifferenceIdentificationMessage } from "../../../common/communication/IDifferenceIdentificationMessage";
import { Title } from "../../../common/communication/TitleEnum";
import { Bitmap } from "./Bitmap/Bitmap";
import { ISimpleIdentification } from "./ISimpleIdentification";
import { IdentificationService } from "./identification.service";
import { ImageValidationService } from "./image-validation.service";

describe("IdentificationService", () => {

    const pixelPerfectImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/pixelPerfect.bmp"));

    const imageValidationService: ImageValidationService = new ImageValidationService();
    imageValidationService.verifyImageDifference(pixelPerfectImage);

    const differenceRegionsJSON: string = readFileSync("./differences/pixelPerfect.json").toString();
    const differenceRegions: IDifferenceRegions = JSON.parse(differenceRegionsJSON);

    const identificationService: IdentificationService = new IdentificationService();

    describe("#1 verifyPosition", () => {

        let regionNumber: number = 3;
        let randomCoordinates: number;
        let clickPosition: ICoordinate;
        let expectedRegion: ICoordinate[];
        let responseRegion: ICoordinate[];

        beforeEach(() => {
            expectedRegion = differenceRegions.regions[regionNumber--];
            if (expectedRegion.length !== 0) {
                randomCoordinates = Math.floor(Math.random() * expectedRegion.length);
                clickPosition = expectedRegion[randomCoordinates];
                responseRegion = identificationService.verifyPosition(differenceRegions.regions, clickPosition);
            } else {
                clickPosition = {"x": 40, "y": 350};
            }
            responseRegion = identificationService.verifyPosition(differenceRegions.regions, clickPosition);
        });

        it("should return region1 when the pixel is part of region1", () => {
            expect(responseRegion).to.have.deep.members(expectedRegion);
        });

        it("should return region2 when the pixel is part of region2", () => {
            expect(responseRegion).to.have.deep.members(expectedRegion);
        });

        it("should return region3 when the pixel is part of region3", () => {
            expect(responseRegion).to.have.deep.members(expectedRegion);
        });

        it("should return an empty array if the pixel is not part of a difference", () => {
            expect(responseRegion).to.have.deep.members(expectedRegion);
        });

    });

    describe("#2 replacePixels(pixelDifferences: IPixelDifferences)", () => {

        const originalImage: Bitmap = new Bitmap(readFileSync("./test-images/image1.bmp"));
        const modifiedImage: Bitmap = new Bitmap(readFileSync("./test-images/image2.bmp"));

        it("#2.1 If input is of correct format, should generate an image with the correct differences", () => {
            const coord1: ICoordinate = { x: 0, y: 0 };
            const coord2: ICoordinate = { x: 639, y: 479 };
            const pixelDifferences: ISimpleIdentification = {
                coordinate: coord1,
                originalImage: originalImage,
                modifiedImage: modifiedImage,
            };
            const outputImageUrl: string = identificationService.replacePixels([coord1, coord2], pixelDifferences);
            const outputImageDataString: string = outputImageUrl.replace("data:image/bmp;base64,", "");
            const outputImageBuffer: Buffer = Buffer.from(outputImageDataString, "base64");
            const outputImage: Bitmap = new Bitmap(outputImageBuffer);
            expect(outputImage.getPixels()).to.deep.equal(originalImage.getPixels());
        });
    });

    describe("#3 generateResponse(data: ISimpleIdentification, differenceRegions: ICoordinate[][])", () => {
        const errorCoordinate: ICoordinate = {x: 0, y: 0};
        const successCoordinate: ICoordinate = {x: 4, y: 471};
        const region: ICoordinate[][] = differenceRegions.regions;
        it("#3.1 Should return false when no difference is found", () => {
            const errorData: ISimpleIdentification = {
                coordinate: errorCoordinate,
                originalImage: pixelPerfectImage,
                modifiedImage: pixelPerfectImage,
            };
            const returnMessage: IDifferenceIdentificationMessage = identificationService.generateResponse(errorData, region);
            expect(returnMessage.differenceIdentified).to.equal(false);
        });

        it("#3.2 Should return true when a difference is found", () => {
            const successData: ISimpleIdentification = {
                coordinate: successCoordinate,
                originalImage: pixelPerfectImage,
                modifiedImage: pixelPerfectImage,
            };
            const expectedResponse: IDifferenceIdentificationMessage = {
                title: Title.SUCCESS,
                coordinates: region[1],
                differenceIdentified: true,
                newModifiedImageURL: "",
            };
            const returnMessage: IDifferenceIdentificationMessage = identificationService.generateResponse(successData, region);
            expect(returnMessage.title).to.equal(expectedResponse.title);
            expect(returnMessage.coordinates).to.have.deep.members(expectedResponse.coordinates as ICoordinate[]);
            expect(returnMessage.differenceIdentified).to.equal(expectedResponse.differenceIdentified);

        });
    });
});
