import { expect } from "chai";
import { readFileSync } from "fs";
import { BitmapFormatError } from "../../errors/BitmapFormatError";
import { Bitmap } from "./Bitmap";
import { IBitmapFileHeader } from "./IBitmapFileHeader";
import { IBitmapInfoHeader } from "./IBitmapInfoHeader";
import { IPixel } from "./IPixel";

describe("Bitmap class", () => {
    const buffer: Buffer = Buffer.from(readFileSync("./test-images/image1.bmp"));
    const image1: Bitmap = new Bitmap(buffer);
    const image2: Bitmap = new Bitmap(readFileSync("./test-images/image2.bmp"));
    const badSizeImage: Buffer = readFileSync("./test-images/image4.bmp");

    it("getFileHeader should return the correct header", () => {
        const fileHeader: IBitmapFileHeader = {
            bfType: 19778,
            bfSize: 921654,
            bfReserved1: 0,
            bfReserved2: 0,
            bfOffBits: 54,
        };
        expect(image1.getFileHeader()).to.deep.equal(fileHeader);
    });

    it("getInfoHeader should return the correct header", () => {
        const infoHeader: IBitmapInfoHeader = {
            biSize: 40,
            biWidth: 640,
            biHeight: 480,
            biPlanes: 1,
            biBitCount: 24,
            biCompression: 0,
            biSizeImage: 921600,
            biXPelsPerMeter: 0,
            biYPelsPerMeter: 0,
            biClrUsed: 0,
            biClrImportant: 0,
        };
        expect(image1.getInfoHeader()).to.deep.equal(infoHeader);
    });

    it("getPixel should return the correct Pixel", () => {
        const pixel: IPixel = { R: 237, G: 28, B: 36 };
        expect(image2.getPixel(0, 0)).to.deep.equal(pixel);
    });

    it("setPixel should set the correct pixel to the correct color", () => {
        const pixel: IPixel = { R: 100, G: 100, B: 100 };
        image2.setPixel(1, 1, pixel);
        expect(image2.getPixel(1, 1)).to.deep.equal(pixel);
    });

    it("setPixels should return the correct array of pixels", () => {
        const pixels: IPixel[][] = image1.getPixels();
        image2.setPixels(pixels);
        expect(image2.getPixels()).to.equal(pixels);
    });

    it("If image does not have correct dimensions, should throw exception", () => {
        expect(() => new Bitmap(badSizeImage)).to.throw(BitmapFormatError, "L'image doit être de 640 x 480");
    });

    it("If buffer is empty, should throw exception", () => {
        expect(() => new Bitmap(Buffer.alloc(0))).to.throw(BitmapFormatError, "Le fichier est vide");
    });

    it("If image is not a 24 bit BMP, should throw exception", () => {
        expect(() => new Bitmap(readFileSync("./test-images/16bitBmp.bmp")))
            .to.throw(BitmapFormatError, "L'image n'est pas un BMP 24 bits");
    });

    it("toBuffer should return the correct buffer", () => {
        expect(image1.toBuffer().values).to.equal(buffer.values);
    });
});
