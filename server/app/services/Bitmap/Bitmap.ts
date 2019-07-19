import { BitmapFormatError } from "../../errors/BitmapFormatError";
import { IBitmapFileHeader } from "./IBitmapFileHeader";
import { IBitmapInfoHeader } from "./IBitmapInfoHeader";
import { IPixel } from "./IPixel";

enum OFFSETS {
    BFTYPE = 0,
    BFSIZE = 2,
    RESERVED1 = 6,
    RESERVED2 = 8,
    OFFBITS = 10,
    SIZE = 14,
    WIDTH = 18,
    HEIGHT = 22,
    PLANES = 26,
    BITCOUNT = 28,
    COMPRESSION = 30,
    SIZEIMAGE = 34,
    XPELSPERMETER = 38,
    YPELSPERMETER = 42,
    CLRUSED = 46,
    CLRIMPORTANT = 50,
}

export class Bitmap {

    private fileHeader: IBitmapFileHeader;
    private infoHeader: IBitmapInfoHeader;
    private pixels: IPixel[][];

    public constructor(buffer: Buffer) {

        this.verifyFormat(buffer);
    }

    private verifyFormat(buffer: Buffer): void {

        if (!buffer.length) {
            throw new BitmapFormatError("Le fichier est vide");
        }

        this.fileHeader = this.initFileHeader(buffer);
        this.infoHeader = this.initFileInfo(buffer);

        const bitCount: number = 24;

        if (this.infoHeader.biBitCount !== bitCount) {
            throw new BitmapFormatError("L'image n'est pas un BMP 24 bits");
        }

        const WIDTH: number = 640;
        const HEIGHT: number = 480;

        const hasCorrectDimensions: boolean = this.getHeight() === HEIGHT && this.getWidth() === WIDTH;
        if (!hasCorrectDimensions) {
            throw new BitmapFormatError("L'image doit être de 640 x 480");
        }

        this.initPixels(buffer);
    }

    private initFileHeader(buffer: Buffer): IBitmapFileHeader {
        return {
            bfType: buffer.readUInt16LE(OFFSETS.BFTYPE),
            bfSize: buffer.readUInt32LE(OFFSETS.BFSIZE),
            bfReserved1: buffer.readUInt16LE(OFFSETS.RESERVED1),
            bfReserved2: buffer.readUInt16LE(OFFSETS.RESERVED2),
            bfOffBits: buffer.readUInt32LE(OFFSETS.OFFBITS),
        };
    }

    private writeFileHeader(buffer: Buffer): void {
        buffer.writeUInt16LE(this.fileHeader.bfType, OFFSETS.BFTYPE);
        buffer.writeUInt32LE(this.fileHeader.bfSize, OFFSETS.BFSIZE);
        buffer.writeUInt16LE(this.fileHeader.bfReserved1, OFFSETS.RESERVED1);
        buffer.writeUInt16LE(this.fileHeader.bfReserved2, OFFSETS.RESERVED2);
        buffer.writeUInt32LE(this.fileHeader.bfOffBits, OFFSETS.OFFBITS);
    }

    private initFileInfo(buffer: Buffer): IBitmapInfoHeader {
        return {
            biSize: buffer.readUInt32LE(OFFSETS.SIZE),
            biWidth: buffer.readUInt32LE(OFFSETS.WIDTH),
            biHeight: buffer.readUInt32LE(OFFSETS.HEIGHT),
            biPlanes: buffer.readUInt16LE(OFFSETS.PLANES),
            biBitCount: buffer.readUInt16LE(OFFSETS.BITCOUNT),
            biCompression: buffer.readUInt32LE(OFFSETS.COMPRESSION),
            biSizeImage: buffer.readUInt32LE(OFFSETS.SIZEIMAGE),
            biXPelsPerMeter: buffer.readUInt32LE(OFFSETS.XPELSPERMETER),
            biYPelsPerMeter: buffer.readUInt32LE(OFFSETS.YPELSPERMETER),
            biClrUsed: buffer.readUInt32LE(OFFSETS.CLRUSED),
            biClrImportant: buffer.readUInt32LE(OFFSETS.CLRIMPORTANT),
        };
    }

    private writeFileInfo(buffer: Buffer): void {
        buffer.writeUInt32LE(this.infoHeader.biSize, OFFSETS.SIZE);
        buffer.writeUInt32LE(this.infoHeader.biWidth, OFFSETS.WIDTH);
        buffer.writeUInt32LE(this.infoHeader.biHeight, OFFSETS.HEIGHT);
        buffer.writeUInt16LE(this.infoHeader.biPlanes, OFFSETS.PLANES);
        buffer.writeUInt16LE(this.infoHeader.biBitCount, OFFSETS.BITCOUNT);
        buffer.writeUInt32LE(this.infoHeader.biCompression, OFFSETS.COMPRESSION);
        buffer.writeUInt32LE(this.infoHeader.biSizeImage, OFFSETS.SIZEIMAGE);
        buffer.writeUInt32LE(this.infoHeader.biXPelsPerMeter, OFFSETS.XPELSPERMETER);
        buffer.writeUInt32LE(this.infoHeader.biYPelsPerMeter, OFFSETS.YPELSPERMETER);
        buffer.writeUInt32LE(this.infoHeader.biClrUsed, OFFSETS.CLRUSED);
        buffer.writeUInt32LE(this.infoHeader.biClrImportant, OFFSETS.CLRIMPORTANT);
    }

    private initPixels(buffer: Buffer): void {
        const pixels: IPixel[][] = [];
        const WIDTH: number = this.infoHeader.biWidth;
        const HEIGHT: number = this.infoHeader.biHeight;

        for (let x: number = 0; x < WIDTH; x++) {
            pixels[x] = new Array<IPixel>(HEIGHT);
        }

        let offset: number = this.fileHeader.bfOffBits;
        for (let y: number = 0; y < HEIGHT; y++) {
            for (let x: number = 0; x < WIDTH; x++) {
                const blue: number = buffer.readUInt8(offset++);
                const green: number = buffer.readUInt8(offset++);
                const red: number = buffer.readUInt8(offset++);
                pixels[x][y] = { R: red, G: green, B: blue };
            }
        }

        this.pixels = pixels;
    }

    private writePixels(buffer: Buffer): void {
        const width: number = 640;
        const height: number = 480;
        const pixels: IPixel[][] = this.getPixels();

        let offset: number = this.fileHeader.bfOffBits;

        for (let y: number = 0; y < height; y++) {
            for (let x: number = 0; x < width; x++) {
                buffer.writeUInt8(pixels[x][y].B, offset++);
                buffer.writeUInt8(pixels[x][y].G, offset++);
                buffer.writeUInt8(pixels[x][y].R, offset++);
            }
        }
    }

    public getFileHeader(): IBitmapFileHeader {
        return this.fileHeader;
    }

    public getInfoHeader(): IBitmapInfoHeader {
        return this.infoHeader;
    }

    public getPixels(): IPixel[][] {
        return this.pixels;
    }

    public getWidth(): number {
        return this.infoHeader.biWidth;
    }

    public getHeight(): number {
        return this.infoHeader.biHeight;
    }

    public setPixels(newPixels: IPixel[][]): void {
        this.pixels = newPixels;
    }

    public setPixel(x: number, y: number, pixel: IPixel): void {
        this.pixels[x][y] = pixel;
    }

    public getPixel(x: number, y: number): IPixel {
        return this.pixels[x][y];
    }

    public toBuffer(): Buffer {
        const buffer: Buffer = Buffer.alloc(this.fileHeader.bfSize);
        this.writeFileHeader(buffer);
        this.writeFileInfo(buffer);
        this.writePixels(buffer);

        return buffer;
    }

}
