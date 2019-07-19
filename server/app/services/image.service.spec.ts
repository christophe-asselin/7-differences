import { assert, expect } from "chai";
import { readFileSync } from "fs";
import { IImageValidationMessage } from "../../../common/communication/IImageValidationMessage";
import { Title } from "../../../common/communication/TitleEnum";
import { Bitmap } from "./Bitmap/Bitmap";
import { IBitmapImages } from "./IBitmapImages";
import { DifferenceGeneratorService } from "./difference-generator.service";
import { ImageValidationService } from "./image-validation.service";
import { ImageService } from "./image.service";

describe("ImageService", () => {
    const imageValidService: ImageValidationService = new ImageValidationService();
    const diffGeneratorService: DifferenceGeneratorService = new DifferenceGeneratorService();
    let imageService: ImageService;

    const originalImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/sevenDifferences.bmp"));
    const modifiedImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/blankImage.bmp"));
    const incorrectImage: Bitmap = new Bitmap(readFileSync("./test-images-validation/fiveDifferences.bmp"));

    beforeEach(() => {
        imageService = new ImageService(diffGeneratorService, imageValidService);
    });

    it("Should be created", (done: Function) => {
        assert.ok(imageService);
        done();
    });

    describe("#1 verifyImage(data: IDifference)", () => {
        it("#1.1 Should return a success message if the images are in the correct format", async () => {
            const differences: IBitmapImages = {
                originalImage: originalImage,
                modifiedImage: modifiedImage,
            };

            const message: IImageValidationMessage = await imageService.verifyImage(differences);
            expect(message.title).to.equal(Title.SUCCESS);
        });

        it("#1.2 Should return an error message if the images are not the correct format", async () => {
            const differences: IBitmapImages = {
                originalImage: incorrectImage,
                modifiedImage: modifiedImage,
            };

            const message: IImageValidationMessage = await imageService.verifyImage(differences);
            expect(message.title).to.equal(Title.FAIL);
        });
    });
});
