import { expect } from "chai";
import { readFileSync } from "fs";
import { Bitmap } from "./Bitmap/Bitmap";
import { IBitmapImages } from "./IBitmapImages";
import { DifferenceGeneratorService } from "./difference-generator.service";

describe("Difference generator service", () => {
    const differenceGenerator: DifferenceGeneratorService = new DifferenceGeneratorService();
    const originalImage: Bitmap = new Bitmap(readFileSync("./test-images/original.bmp"));
    const modifiedImage: Bitmap = new Bitmap(readFileSync("./test-images/modified.bmp"));
    const differencesImage: Bitmap = new Bitmap(readFileSync("./test-images/differences.bmp"));
    const edgeImage: Bitmap = new Bitmap(readFileSync("./test-images/edges.bmp"));
    const whiteImage: Bitmap = new Bitmap(readFileSync("./test-images/white.bmp"));

    it("If input is of correct format, should generate an image with the correct differences", async () => {
        const data: IBitmapImages = {originalImage: originalImage, modifiedImage: modifiedImage};
        differenceGenerator.generateDifferenceImage(data);
        expect(new Bitmap(readFileSync("./differences/testImage.bmp"))).to.deep.equal(differencesImage);
    });

    it("Should not throw error when enlarging pixels on the edge of image", async () => {
        const data: IBitmapImages = {originalImage: edgeImage, modifiedImage: whiteImage};
        expect(async () => differenceGenerator.generateDifferenceImage(data)).to.not.throw();
    });

    it("Should generate an image with the correct differences", async () => {
        const data: IBitmapImages = {originalImage: originalImage, modifiedImage: modifiedImage};
        differenceGenerator.generateDifferenceImage(data);
        expect(new Bitmap(readFileSync("./differences/testImage.bmp"))).to.deep.equal(differencesImage);
    });
});
