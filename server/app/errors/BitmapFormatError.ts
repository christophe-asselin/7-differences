export class BitmapFormatError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = "BitmapFormatError";
    }
}
