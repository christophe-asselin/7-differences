import { OnGoingGameService } from "./on-going-game.service";

import { expect } from "chai";
import { Game3DType } from "../../../common/Game3DType";
import { GameState, GameType } from "../../../common/GameEnum";
import { IFreeGame } from "../../../common/IFreeGame";
import { ISimpleGame } from "../../../common/ISimpleGame";

const service: OnGoingGameService = new OnGoingGameService();

const GAME_ID: string = "1";
const SIMPLE_GAME: ISimpleGame = {
    _id: GAME_ID,
    name: "",
    type: GameType.SIMPLE,
    originalImageURL: "",
    modifiedImageURL: "",
    differenceRegions: [],
    scoreSolo: [],
    scoreDuo: [],
    state: GameState.NOT_WAITING,
};

const FREE_GAME: IFreeGame = {
    _id: GAME_ID,
    name: "",
    type: GameType.FREE,
    game3Dtype: Game3DType.GEOMETRIC,
    originalImageURL: "",
    scoreSolo: [],
    scoreDuo: [],
    originalObjects: [],
    modifiedObjects: [],
    state: GameState.NOT_WAITING,
};

describe ("OnGoingGameService", () => {

    it("should create", () => {
        // tslint considere comme inutilise
        // tslint:disable-next-line: no-unused-expression
        expect(service).to.be.ok;
    });

    it("OnGoingGame should contain 0 onGoingSimpleGame when GameService is initialize", () => {
        expect(service["onGoingSimpleGames"].length).to.equal(0);
      });

    it("OnGoingGame should contain 0 onGoingFreeGame when GameService is initialize", () => {
        expect(service["onGoingFreeGames"].length).to.equal(0);
      });
    });

describe ("OnGoingGameService: addSimpleGame / addFreeGame", () => {

      it("addOnGoingGame should add ISimpleGame to simpleGames and not to freeGames", () => {
        service.addOnGoingGame(SIMPLE_GAME);
        expect(service["onGoingSimpleGames"][0]).to.equal(SIMPLE_GAME);
        expect(service["onGoingSimpleGames"].length).to.equal(1);
      });

      it("addOnGoingGame should add IFreeGame to freeGames and not to simpleGames", () => {
        service.addOnGoingGame(FREE_GAME);
        expect(service["onGoingFreeGames"][0]).to.equal(FREE_GAME);
        expect(service["onGoingFreeGames"].length).to.equal(1);
      });

    });

describe ("OnGoingGameService: getOnGoingSimpleGame / getOnGoingFreeGame", () => {
    it("getOnGoingSimpleGame should return SIMPLE_GAME", () => {
     expect(service["getOnGoingSimpleGame"](GAME_ID)).to.equal(SIMPLE_GAME);
    });

    it("getOnGoingFreeGame should return FREE_GAME", () => {
     expect(service["getOnGoingFreeGame"](GAME_ID)).to.equal(FREE_GAME);
    });
});

describe ("OnGoingGameService: removeOnGoingGame", () => {

    it("removeGame should remove the right simple game from simpleGames array", () => {
      const N_SIMPLE_GAMES_EXPECTED: number = 0;

      service.removeOnGoingGame(GAME_ID, GameType.SIMPLE);
      expect(service["onGoingSimpleGames"].length).to.equal(N_SIMPLE_GAMES_EXPECTED);
        });

    it("removeGame should remove the right free game from freeGames array", () => {
          const N_FREE_GAMES_EXPECTED: number = 0;

          service.removeOnGoingGame(GAME_ID, GameType.FREE);
          expect(service["onGoingFreeGames"].length).to.equal(N_FREE_GAMES_EXPECTED);
        });
      });
