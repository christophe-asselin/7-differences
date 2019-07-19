import { GameService } from "./game.service";

import { assert, expect } from "chai";
import sinon = require("sinon");
import { GameState, GameType } from "../../../common/GameEnum";
import { IDuoGame } from "../../../common/IDuoGame";
import { IDuoPlayer } from "../../../common/IDuoPlayer";
import { IUser } from "../../../common/IUser";
import { DuoGameService } from "./duo-game.service";

const gameService: GameService = new GameService(); // car gameService.inSingletonScope();
const duoGameService: DuoGameService = new DuoGameService(gameService); // car duoGameService.inSingletonScope();

const ID_GAME_1_EXPECTED: string = "1"; // SIMPLE_GAME
let N_PLAYERS_GAME_1_EXPECTED: number = 0;
const ID_DUO_1_EXPECTED: number = 0;

const ID_GAME_2_EXPECTED: string = "3"; // FREE_GAME
let N_PLAYERS_GAME_2_EXPECTED: number = 0;
const ID_DUO_2_EXPECTED: number = 1;

let N_DUO_GAMES_EXPECTED: number = 0;

describe("DuoGameService: createDuoGame", () => {
    let spySetState: sinon.SinonSpy<[string, GameType, GameState], Promise<void>>;

    beforeEach(() => {
        spySetState = sinon.spy(gameService, "setState");
    });

    afterEach(() => {
        spySetState.restore();
    });

    it("DuoGameService should be created", (done: Function) => {
      assert.ok(duoGameService);
      done();
    });

    it("should create a IDuoGame with one player for a simple game and change state of the game to WAITING",
       async () => {
        const FIRST_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "0", username: "username1Game1"}, nDiffFound: 0};

        const DUO_GAME_EXPECTED: IDuoGame = {
            idDuo: ID_DUO_1_EXPECTED,
            idGame: ID_GAME_1_EXPECTED,
            duoPlayers: [FIRST_PLAYER_EXPECTED],
            identifiedDifferences: [],
        };

        const game: IDuoGame =
        await duoGameService.createDuoGame(ID_GAME_1_EXPECTED, GameType.SIMPLE, {userId: "0", username: "username1Game1"});
        expect(spySetState.calledWithExactly(ID_GAME_1_EXPECTED, GameType.SIMPLE, GameState.WAITING)).to.equal(true);
        expect(game).to.deep.equals(DUO_GAME_EXPECTED);
        expect(game.duoPlayers.length).to.equal(++N_PLAYERS_GAME_1_EXPECTED);
        expect(duoGameService.getDuoGames().length).to.equal(++N_DUO_GAMES_EXPECTED);

    });

    it("should create a other IDuoGame with one player for a free game and change state of the game to WAITING",
       async() => {
        const FIRST_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "1", username: "username1Game2"}, nDiffFound: 0};

        const DUO_GAME_EXPECTED: IDuoGame = {
            idDuo: ID_DUO_2_EXPECTED,
            idGame: ID_GAME_2_EXPECTED,
            duoPlayers: [FIRST_PLAYER_EXPECTED],
            identifiedDifferences: [],
        };

        const game: IDuoGame =
        await duoGameService.createDuoGame(ID_GAME_2_EXPECTED, GameType.FREE, {userId: "1", username: "username1Game2"});

        expect(spySetState.calledWithExactly(ID_GAME_2_EXPECTED, GameType.FREE, GameState.WAITING)).to.equal(true);

        expect(game).to.deep.equals(DUO_GAME_EXPECTED);
        expect(game.duoPlayers.length).to.equal(++N_PLAYERS_GAME_2_EXPECTED);

        expect(duoGameService.getDuoGames().length).to.equal(++N_DUO_GAMES_EXPECTED);

    });

});

describe("DuoGameService: joinGame", () => {
    let spySetState: sinon.SinonSpy<[string, GameType, GameState], Promise<void>>;
    let spyJoinGame: sinon.SinonSpy<[string, GameType, IUser], Promise<IDuoGame>>;

    beforeEach(() => {
        spySetState = sinon.spy(gameService, "setState");
        spyJoinGame = sinon.spy(duoGameService, "joinGame");
    });

    afterEach(() => {
        spySetState.restore();
        spyJoinGame.restore();
    });

    it("should join the user to the right game that is waiting for a player and change state of the game to NOT_WAITING",
       async() => {
        const FIRST_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "0", username: "username1Game1"}, nDiffFound: 0};
        const NEW_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "2", username: "username2Game1"}, nDiffFound: 0};

        const DUO_GAME_EXPECTED: IDuoGame = {
            idDuo: ID_DUO_1_EXPECTED,
            idGame: ID_GAME_1_EXPECTED,
            duoPlayers: [FIRST_PLAYER_EXPECTED, NEW_PLAYER_EXPECTED],
            identifiedDifferences: [],
        };

        const game: IDuoGame = await duoGameService.joinGame("1", GameType.SIMPLE, {userId: "2", username: "username2Game1"});

        expect(spySetState.calledWithExactly(ID_GAME_1_EXPECTED, GameType.SIMPLE, GameState.NOT_WAITING)).to.equal(true);

        expect(game).to.deep.equals(DUO_GAME_EXPECTED);
        expect(game.duoPlayers.length).to.equal(++N_PLAYERS_GAME_1_EXPECTED);

        expect(duoGameService.getDuoGames().length).to.equal(N_DUO_GAMES_EXPECTED);
    });

});

describe("DuoGameService: getDuoGame", () => {

    it("should return the right duoGame", () => {
        const spyGetDuoGame: sinon.SinonSpy<[string], IDuoGame> = sinon.spy(duoGameService, "getDuoGame");

        const FIRST_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "0", username: "username1Game1"}, nDiffFound: 0};
        const NEW_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "2", username: "username2Game1"}, nDiffFound: 0};

        const DUO_GAME_EXPECTED: IDuoGame = {
            idDuo: ID_DUO_1_EXPECTED,
            idGame: ID_GAME_1_EXPECTED,
            duoPlayers: [FIRST_PLAYER_EXPECTED, NEW_PLAYER_EXPECTED],
            identifiedDifferences: [],
        };

        duoGameService.getDuoGame("username1Game1");

        expect(spyGetDuoGame.returnValues[0]).to.deep.equals(DUO_GAME_EXPECTED);
    });

});

describe("DuoGameService: simpleDifferenceFound", () => {

    it("should increment nDiffFound of the right player and update the modifiedImageURL", () => {
        const spySimpleDiffFound: sinon.SinonSpy<[number, string, string, boolean[][]], IDuoGame>
        = sinon.spy(duoGameService, "simpleDifferenceFound");

        const FIRST_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "0", username: "username1Game1"}, nDiffFound: 1};
        const NEW_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "2", username: "username2Game1"}, nDiffFound: 0};

        const DUO_GAME_EXPECTED: IDuoGame = {
            idDuo: ID_DUO_1_EXPECTED,
            idGame: ID_GAME_1_EXPECTED,
            duoPlayers: [FIRST_PLAYER_EXPECTED, NEW_PLAYER_EXPECTED],
            modifiedImageURL: "new_url",
            identifiedDifferences: [],
        };

        duoGameService.simpleDifferenceFound(ID_DUO_1_EXPECTED, "username1Game1", "new_url", []);

        expect(spySimpleDiffFound.returnValues[0]).to.deep.equals(DUO_GAME_EXPECTED);
    });

});

describe("DuoGameService: freeDifferenceFound", () => {

    it("should increment nDiffFound and return the correct game", async () => {
        await duoGameService.createDuoGame("5", GameType.FREE, {userId: "4", username: "username1Game3"});
        N_DUO_GAMES_EXPECTED++;
        await duoGameService.joinGame("5", GameType.FREE, {userId: "5", username: "username2Game3"});

        const spyFreeDiffFound: sinon.SinonSpy<[number, string, number], IDuoGame> = sinon.spy(duoGameService, "freeDifferenceFound");

        const FIRST_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "4", username: "username1Game3"}, nDiffFound: 1};
        const NEW_PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "5", username: "username2Game3"}, nDiffFound: 0};
        const ID_DUO_3: number = 2;

        const DUO_GAME_EXPECTED: IDuoGame = {
            idDuo: ID_DUO_3,
            idGame: "5",
            duoPlayers: [FIRST_PLAYER_EXPECTED, NEW_PLAYER_EXPECTED],
            identifiedDifferences: [],
            object3DIndex: 1,
        };

        duoGameService.freeDifferenceFound(ID_DUO_3, "username1Game3", 1);

        expect(spyFreeDiffFound.returnValues[0]).to.deep.equals(DUO_GAME_EXPECTED);
    });

});

describe("DuoGameService: findRooms", () => {

    it("should return all rooms names for a game", () => {
        const spyFindRooms: sinon.SinonSpy<[string], string[]> = sinon.spy(duoGameService, "findRooms");

        const ROOMS_EXPECTED: string[] = [ID_GAME_1_EXPECTED + "/" + ID_DUO_1_EXPECTED];

        duoGameService.findRooms(ID_GAME_1_EXPECTED);

        expect(spyFindRooms.returnValues[0]).to.deep.equals(ROOMS_EXPECTED);
    });

});

describe("DuoGameService: deletePlayer", () => {
    let spySetState: sinon.SinonSpy<[string, GameType, GameState], Promise<void>>;

    beforeEach(() => {
        spySetState = sinon.spy(gameService, "setState");
    });

    afterEach(() => {
        spySetState.restore();
    });

    it("should remove the user from duoPlayers of the right duoGame and set state", async() => {
        const PLAYER_EXPECTED: IDuoPlayer = {user: {userId: "2", username: "username2Game1"}, nDiffFound: 0};

        const DUO_GAME_EXPECTED: IDuoGame = {
            idDuo: ID_DUO_1_EXPECTED,
            idGame: ID_GAME_1_EXPECTED,
            duoPlayers: [PLAYER_EXPECTED],
            modifiedImageURL: "new_url",
            identifiedDifferences: [],
        };

        const game: IDuoGame = await duoGameService.deletePlayer(ID_GAME_1_EXPECTED, GameType.SIMPLE, "username1Game1");

        expect(spySetState.calledWithExactly(ID_GAME_1_EXPECTED, GameType.SIMPLE, GameState.NOT_WAITING)).to.equal(true);

        expect(game).to.deep.equals(DUO_GAME_EXPECTED);
        expect(game.duoPlayers.length).to.equal(--N_PLAYERS_GAME_1_EXPECTED);

        expect(duoGameService.getDuoGames().length).to.equal(N_DUO_GAMES_EXPECTED);
    });

    it("should remove the user from duoPlayers of the right duoGame, change state and remove duoGame if IDuoPlayer[] is empty",
       async() => {

        const DUO_GAME_EXPECTED: IDuoGame = {
            idDuo: -1,
            idGame: ID_GAME_2_EXPECTED,
            duoPlayers: [],
            identifiedDifferences: [],
        };

        const game: IDuoGame = await duoGameService.deletePlayer(ID_GAME_2_EXPECTED, GameType.FREE, "username1Game2");

        expect(spySetState.calledWithExactly(ID_GAME_2_EXPECTED, GameType.FREE, GameState.NOT_WAITING)).to.equal(true);

        expect(game).to.deep.equals(DUO_GAME_EXPECTED);
        expect(game.duoPlayers.length).to.equal(--N_PLAYERS_GAME_2_EXPECTED);

        expect(duoGameService.getDuoGames().length).to.equal(--N_DUO_GAMES_EXPECTED);
    });
});

describe ("DuoGameService: CheckIfEndDuoGame", () => {
    let spyEndGame: sinon.SinonSpy<[number], IUser[]>;

    const FIRST_PLAYER: IUser = {userId: "4", username: "username1Game3"};
    const SECOND_PLAYER: IUser = {userId: "5", username: "username2Game3"};

    const ID_DUO_3: number = 2;

    beforeEach(() => {
        spyEndGame = sinon.spy(duoGameService, "checkIfEndDuoGame");
    });

    afterEach(() => {
        spyEndGame.restore();
    });

    it("should return empty array if no player has 4 differences found", () => {
        duoGameService.checkIfEndDuoGame(ID_DUO_3);
        expect(spyEndGame.returnValues[0]).to.deep.equals([]);
    });

    it("should return array of players in the right order [Winner, Loser] if one of the players has 4 differences found", () => {
        const PLAYERS_EXPECTED: IUser[] = [FIRST_PLAYER, SECOND_PLAYER];
        duoGameService.freeDifferenceFound(ID_DUO_3, FIRST_PLAYER.username, 1);
        duoGameService.freeDifferenceFound(ID_DUO_3, FIRST_PLAYER.username, 1);
        duoGameService.freeDifferenceFound(ID_DUO_3, FIRST_PLAYER.username, 1);

        duoGameService.checkIfEndDuoGame(ID_DUO_3);
        expect(spyEndGame.returnValues[0]).to.deep.equals(PLAYERS_EXPECTED);
    });

});
