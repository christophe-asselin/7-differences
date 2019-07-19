import { assert } from "chai";
import { BestScoreService } from "./best-score.service";
import { DuoGameService } from "./duo-game.service";
import { GameService } from "./game.service";
import { OnGoingGameService } from "./on-going-game.service";
import { SocketEmitterService } from "./socket-emitter.service";
import { UserService } from "./user.service";

describe("SocketEmitterService", () => {

    const userService: UserService = new UserService();
    const gameService: GameService = new GameService();
    const onGoingGameService: OnGoingGameService = new OnGoingGameService();
    const bestScoreService: BestScoreService = new BestScoreService(gameService, onGoingGameService);
    const duoGameService: DuoGameService = new DuoGameService(gameService);

    let socketEmitterService: SocketEmitterService;
    socketEmitterService = new SocketEmitterService(userService, gameService, bestScoreService, duoGameService, onGoingGameService);

    it("Should be created", (done: Function) => {
        assert.ok(socketEmitterService);
        done();
    });
});
