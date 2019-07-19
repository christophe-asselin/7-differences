export class GameNotFoundError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = "GameNotFoundError";
    }
}
