import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import { inject, injectable } from "inversify";
import { MongoError } from "mongodb";
import * as mongoose from "mongoose";
import * as logger from "morgan";
import * as multer from "multer";
import { GameController } from "./controllers/game.controller";
import { IdentificationController } from "./controllers/identification.controller";
import { ImageController } from "./controllers/image.controller";
import { UserController } from "./controllers/user.controller";
import Types from "./types";

@injectable()
export class Application {

    private readonly internalError: number = 500;
    public app: express.Application;

    public constructor(
        @inject(Types.UserController) private userController: UserController,
        @inject(Types.GameController) private gameController: GameController,
        @inject(Types.ImageController) private imageController: ImageController,
        @inject(Types.IdentificationController) private identificationController: IdentificationController,
        ) {
        this.app = express();

        this.config();

        this.bindRoutes();

        this.connectToDatabase();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
        this.app.use(multer({ storage: multer.memoryStorage() }).fields([
            { name: "originalImage", maxCount: 1 },
            { name: "modifiedImage", maxCount: 1 },
        ]));
    }

    public bindRoutes(): void {
        this.app.use("/api/user", this.userController.router);
        this.app.use("/api/game", this.gameController.router);
        this.app.use("/api/image", this.imageController.router);
        this.app.use("/api/identification", this.identificationController.router);
        this.errorHandeling();
    }

    private errorHandeling(): void {
        // Gestion des erreurs
        this.app.use((_req: express.Request, _res: express.Response, next: express.NextFunction) => {
            const err: Error = new Error("Not Found");
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get("env") === "development") {
            // tslint:disable-next-line:no-any
            this.app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        // tslint:disable-next-line:no-any
        this.app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }

    private connectToDatabase(): void {
        const URI: string = "mongodb+srv://admin:equipe201@projet2-4k2cm.azure.mongodb.net/test?retryWrites=true";
        mongoose.connect(URI, { useNewUrlParser: true }, (err: MongoError) => {
            if (err) {
                console.error("Error connecting to database: " + err.message);
            } else {
                // tslint:disable-next-line: no-console
                console.log("Successfully connected to database");
            }
        });
    }
}
