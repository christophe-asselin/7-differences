export class RequestFormatError extends Error {
    public constructor(message: string) {
        const INCORRECT_FORMAT_MSG: string = "Les données ne respectent pas le format demandé : ";
        super(INCORRECT_FORMAT_MSG + message);
        this.name = "RequestFormatError";
    }
}
