export class DatabaseCommunicationError extends Error {
    public constructor() {
        const COMMUNICATION_ERROR_MSG: string = "An error occured while communicating with the database.";
        super(COMMUNICATION_ERROR_MSG);
        this.name = "DatabaseCommunicationError";
    }
}
