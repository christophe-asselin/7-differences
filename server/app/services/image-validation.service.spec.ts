import { expect } from "chai";
import { readFileSync } from "fs";
import { ICoordinate } from "../../../common/ICoordinate";
import { Bitmap } from "./Bitmap/Bitmap";
import { ImageValidationService } from "./image-validation.service";

describe("ImageValidationService", () => {
    const blankImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/blankImage.BMP"));
    const oneDifferenceImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/oneDifference.BMP"));
    const sideAdjacenceImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/sideAdjacence.BMP"));
    const diagonalAdjacenceImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/diagonalAdjacence.BMP"));
    const fiveDifferencesImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/fiveDifferences.BMP"));
    const sevenDifferencesImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/sevenDifferences.BMP"));
    const nineDifferencesImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/nineDifferences.BMP"));
    const pixelPerfectImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/pixelPerfect.BMP"));

    const region1: ICoordinate[] = [
        {"x": 4, "y": 471}, {"x": 4, "y": 472}, {"x": 5, "y": 471},
        {"x": 4, "y": 473}, {"x": 6, "y": 471}, {"x": 4, "y": 474},
        {"x": 7, "y": 472}, {"x": 7, "y": 471}, {"x": 7, "y": 473},
        {"x": 7, "y": 474},
    ];

    const region2: ICoordinate[] = [
        {"x": 10, "y": 471}, {"x": 9, "y": 472}, {"x": 11, "y": 471},
        {"x": 9, "y": 473}, {"x": 12, "y": 472}, {"x": 10, "y": 474},
        {"x": 12, "y": 473}, {"x": 11, "y": 474},
    ];

    const region3: ICoordinate[] = [
        {"x": 14, "y": 471}, {"x": 15, "y": 472}, {"x": 15, "y": 473},
        {"x": 16, "y": 473}, {"x": 16, "y": 472}, {"x": 14, "y": 474},
        {"x": 17, "y": 474}, {"x": 17, "y": 471},
    ];

    const imageValidationService: ImageValidationService = new ImageValidationService();

    describe("verifyImage", () => {

        it("should count 0 difference in a blank image", () => {
            expect(imageValidationService.verifyImageDifference(blankImage).body).to.equal(
                "L'image contient 0 différence(s), ce qui ne correspond pas à 7.");
        });

        it("should count 1 difference in an image containing 1 difference", () => {
            expect(imageValidationService.verifyImageDifference(diagonalAdjacenceImage).body).to.equal(
                "L'image contient 1 différence(s), ce qui ne correspond pas à 7.");
        });

        it("should count 1 difference in an image containing 5 black squares with connected sides", () => {
            expect(imageValidationService.verifyImageDifference(oneDifferenceImage).body).to.equal(
                "L'image contient 1 différence(s), ce qui ne correspond pas à 7.");
        });

        it("should count 1 difference in an image containing 5 black squares with connected corners", () => {
            expect(imageValidationService.verifyImageDifference(sideAdjacenceImage).body).to.equal(
                "L'image contient 1 différence(s), ce qui ne correspond pas à 7.");
        });

        it("should not validate an image that contains 5 differences", () => {
            expect(imageValidationService.verifyImageDifference(fiveDifferencesImage).body).to.equal(
                "L'image contient 5 différence(s), ce qui ne correspond pas à 7.");
        });

        it("should not validate an image that contains 9 differences", () => {
            expect(imageValidationService.verifyImageDifference(nineDifferencesImage).body).to.equal(
                "L'image contient 9 différence(s), ce qui ne correspond pas à 7.");
        });

        it("should validate an image that contains 7 differences", () => {
            expect(imageValidationService.verifyImageDifference(sevenDifferencesImage).body).to.equal(
                "L'image contient 7 différences.");
        });
    });

    describe("Identification of difference regions", () => {
        let identifiedRegion: ICoordinate[];
        let label: number = 0;

        beforeEach(() => {
            imageValidationService.verifyImageDifference(pixelPerfectImage);
            identifiedRegion = imageValidationService.getDifferenceRegions().regions[++label];
        });

        it("should identify the coordinates of all the pixels that compose region1", () => {
            expect(identifiedRegion).to.have.deep.members(region1);
        });

        it("should identify the coordinates of all the pixels that compose region2", () => {
            expect(identifiedRegion).to.have.deep.members(region2);
        });

        it("should identify the coordinates of all the pixels that compose region3", () => {
            expect(identifiedRegion).to.have.deep.members(region3);
        });
    });

});
