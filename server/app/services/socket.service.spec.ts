import { assert } from "chai";
import { BestScoreService } from "./best-score.service";
import { DuoGameService } from "./duo-game.service";
import { GameService } from "./game.service";
import { OnGoingGameService } from "./on-going-game.service";
import { SocketEmitterService } from "./socket-emitter.service";
import { SocketService } from "./socket.service";
import { UserService } from "./user.service";

describe ("SocketService : User", () => {
    const userService: UserService = new UserService();
    const gameService: GameService = new GameService();
    const onGoingGameService: OnGoingGameService = new OnGoingGameService();
    const bestScoreService: BestScoreService = new BestScoreService(gameService, onGoingGameService);
    const duoGameService: DuoGameService = new DuoGameService(gameService);
    const socketEmitterService: SocketEmitterService =
    new SocketEmitterService(userService, gameService, bestScoreService, duoGameService, onGoingGameService);

    let socketService: SocketService;
    socketService = new SocketService(socketEmitterService);

    it("Should be created", (done: Function) => {
        assert.ok(socketService);
        done();
    });
});
