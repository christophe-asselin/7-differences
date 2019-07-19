import { Container } from "inversify";
import { Application } from "./app";
import { GameController } from "./controllers/game.controller";
import { IdentificationController } from "./controllers/identification.controller";
import { ImageController } from "./controllers/image.controller";
import { UserController } from "./controllers/user.controller";
import { Server } from "./server";
import { BestScoreService } from "./services/best-score.service";
import { DifferenceGeneratorService } from "./services/difference-generator.service";
import { DuoGameService } from "./services/duo-game.service";
import { GameService } from "./services/game.service";
import { IdentificationService } from "./services/identification.service";
import { Identification3DService } from "./services/identification3D.service";
import { ImageValidationService } from "./services/image-validation.service";
import { ImageService } from "./services/image.service";
import { OnGoingGameService } from "./services/on-going-game.service";
import { SocketEmitterService } from "./services/socket-emitter.service";
import { SocketService } from "./services/socket.service";
import { UserService } from "./services/user.service";
import Types from "./types";

const container: Container = new Container();

container.bind(Types.Server).to(Server);
container.bind(Types.Application).to(Application);

container.bind(Types.UserController).to(UserController);
container.bind(Types.UserService).to(UserService).inSingletonScope();

container.bind(Types.SocketService).to(SocketService);
container.bind(Types.SocketEmitterService).to(SocketEmitterService).inSingletonScope();

container.bind(Types.ImageController).to(ImageController);
container.bind(Types.ImageService).to(ImageService).inSingletonScope();
container.bind(Types.DifferenceGeneratorService).to(DifferenceGeneratorService);
container.bind(Types.ImageValidationService).to(ImageValidationService);

container.bind(Types.GameController).to(GameController);
container.bind(Types.GameService).to(GameService).inSingletonScope();
container.bind(Types.BestScoreService).to(BestScoreService);
container.bind(Types.DuoGameService).to(DuoGameService).inSingletonScope();
container.bind(Types.OnGoingGameService).to(OnGoingGameService).inSingletonScope();

container.bind(Types.IdentificationController).to(IdentificationController);
container.bind(Types.IdentificationService).to(IdentificationService).inSingletonScope();
container.bind(Types.Identification3DService).to(Identification3DService).inSingletonScope();

export { container };
