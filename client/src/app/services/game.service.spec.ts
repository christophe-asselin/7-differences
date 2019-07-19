import { TestHelper } from "src/test.helper";

import { GameMode, GameType } from "../../../../common/GameEnum";
import { GameService } from "./game.service";

import { IFreeGame } from "../../../../common/IFreeGame";
import { ISimpleGame } from "../../../../common/ISimpleGame";
import { FREEGAMES, SIMPLEGAMES } from "../../../../common/mock-games";

// No types for Jasmine spies
// tslint:disable-next-line:no-any
let httpClientSpy: any;
let gameService: GameService;

describe("GameService", () => {
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj("HttpClient", ["get"]);
    gameService = new GameService(httpClientSpy);
  });

  it("should create", () => {
    expect(gameService).toBeTruthy();
  });

  describe("#1 getGames(type: Gametype)", () => {

    it("#1.1 Should return the array of simpleGames when called with GameType.SIMPLE", () => {
      const expectedReturnValue: ISimpleGame[] = SIMPLEGAMES;
      httpClientSpy.get.and.returnValue(TestHelper.asyncData(expectedReturnValue));
      gameService.getGames(GameType.SIMPLE).subscribe((games: ISimpleGame[]) => {
        expect(games).toEqual(expectedReturnValue);
      });
    });

    it("#1.2 Should return the array of freeGames when called with GameType.FREE", () => {
      const expectedReturnValue: IFreeGame[] = FREEGAMES;
      httpClientSpy.get.and.returnValue(TestHelper.asyncData(expectedReturnValue));
      gameService.getGames(GameType.FREE).subscribe((games: IFreeGame[]) => {
        expect(games).toEqual(expectedReturnValue);
      });
    });

    it("#1.3 Should return the right game when getGame is called", (done) => {
      const expectedReturnValue: ISimpleGame = SIMPLEGAMES[1];
      httpClientSpy.get.and.returnValue(TestHelper.asyncData(expectedReturnValue));
      gameService.getGame("1", GameType.SIMPLE, GameMode.SOLO).subscribe((game: ISimpleGame) => {
        expect(game).toEqual(expectedReturnValue);
        done();
      });
    });

  });

});
