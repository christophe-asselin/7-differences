import { expect } from "chai";
import * as sinon from "sinon";
import { GameEvent, GameMode, GameState, GameType, RankingString } from "../../../common/GameEnum";
import { IFreeGame } from "../../../common/IFreeGame";
import { IGameMessage } from "../../../common/IGameMessage";
import { IScore } from "../../../common/IScore";
import { ISimpleGame } from "../../../common/ISimpleGame";
import { BestScoreService } from "./best-score.service";
import { GameService } from "./game.service";
import { OnGoingGameService } from "./on-going-game.service";

describe("BestScoreService", () => {

    let gameService: GameService;
    let onGoingGameService: OnGoingGameService;
    let service: BestScoreService;

    beforeEach(() => {
        gameService = new GameService();
        onGoingGameService = new OnGoingGameService();
        service = new BestScoreService(gameService, onGoingGameService);
    });

    describe("#1 generateRandomScore()", () => {
        let generatedScores: IScore[];

        beforeEach(() => {
            generatedScores = BestScoreService.generateRandomScore();
        });

        it("#1.1 should generate 3 scores", () => {
            const N_SCORES: number = 3;
            expect(generatedScores.length).to.equal(N_SCORES);
        });

        it("#1.2 should generate score times beween 20:00 and 39:59", () => {
            const TIME_FORMAT: RegExp = new RegExp("^((2|3)[0-9]):([0-5][0-9])$");
            for (const score of generatedScores) {
                expect(score.time).to.match(TIME_FORMAT);
            }
        });
    });

    describe("#2 sortScore(myScore: IScore[])", () => {
        let generatedScores: IScore[];

        beforeEach(() => {
            generatedScores = BestScoreService.generateRandomScore();
        });

        it("#2.1 should sort scores from smallest to largest time", () => {
            const sortedScores: IScore[] = BestScoreService.sortScore(generatedScores);

            let previousSeconds: number = 0;

            const BASE_10: number = 10;
            const SECONDS_IN_MINUTE: number = 60;

            for (const score of sortedScores) {
                const minutes: number = Number.parseInt(score.time.split(":")[0], BASE_10);
                const seconds: number = Number.parseInt(score.time.split(":")[1], BASE_10);
                const timeInSeconds: number = (minutes * SECONDS_IN_MINUTE) + seconds;

                expect(timeInSeconds).to.be.at.least(previousSeconds);

                previousSeconds = seconds;
            }
        });
    });

    describe("#3 updateScores(idGame: number, type: GameType, nPlayers: GameMode, timeString: string, username: string)", () => {

       let setScoreStub: sinon.SinonStub<[ISimpleGame | IFreeGame, string, IScore[]], Promise<void>>;

       beforeEach(() => {
            sinon.stub(onGoingGameService, "getOnGoingGame").callsFake((): ISimpleGame => {
                return {
                    _id: "0",
                    name: "game",
                    type: GameType.SIMPLE,
                    originalImageURL: "",
                    modifiedImageURL: "",
                    differenceRegions: [],
                    scoreSolo: [
                        { name: "name1", time: "10:10" },
                        { name: "name2", time: "20:20" },
                        { name: "name3", time: "30:30" },
                    ],
                    scoreDuo: [],
                    state: GameState.NOT_WAITING,
                };
            });
        });

       afterEach(() => {
            setScoreStub.restore();
        });

       it("#3.1 should return the correct message if score is new first place", () => {
            setScoreStub = sinon.stub(gameService, "setScores").callsFake(async () => {
                return Promise.resolve();
            });

            const FIRST_PLACE_MSG: IGameMessage = {
                username: "name",
                event: GameEvent.BEST_SCORE,
                gameName: "game",
                nPlayers: GameMode.SOLO,
                position: RankingString.FIRST,
            };
            service.updateScores("0", GameType.SIMPLE, GameMode.SOLO, "01:01", "name").then((outputMessage: IGameMessage) => {
                expect(outputMessage).to.deep.equal(FIRST_PLACE_MSG);
            }).catch();
        });

       it("#3.2 should return the correct message if score is new second place", () => {
            setScoreStub = sinon.stub(gameService, "setScores").callsFake(async () => {
                return Promise.resolve();
            });

            const SECOND_PLACE_MSG: IGameMessage = {
                username: "name",
                event: GameEvent.BEST_SCORE,
                gameName: "game",
                nPlayers: GameMode.SOLO,
                position: RankingString.SECOND,
            };
            service.updateScores("0", GameType.SIMPLE, GameMode.SOLO, "15:15", "name").then((outputMessage: IGameMessage) => {
                expect(outputMessage).to.deep.equal(SECOND_PLACE_MSG);
            }).catch();
        });

       it("#3.3 should return the correct message if score is new third place", () => {
            setScoreStub = sinon.stub(gameService, "setScores").callsFake(async () => {
                return Promise.resolve();
            });

            const THIRD_PLACE_MSG: IGameMessage = {
                username: "name",
                event: GameEvent.BEST_SCORE,
                gameName: "game",
                nPlayers: GameMode.SOLO,
                position: RankingString.THIRD,
            };
            service.updateScores("0", GameType.SIMPLE, GameMode.SOLO, "25:25", "name").then((outputMessage: IGameMessage) => {
                expect(outputMessage).to.deep.equal(THIRD_PLACE_MSG);
            }).catch();
        });

       it("#3.4 should return the correct message if score is not new top score", () => {
            setScoreStub = sinon.stub(gameService, "setScores").callsFake(async () => {
                return Promise.reject();
            });

            const NOT_TOP_MSG: IGameMessage = {
                    username: "name",
                    event: GameEvent.BEST_SCORE,
                    gameName: "game",
                    nPlayers: GameMode.SOLO,
                    position: RankingString.NONE,
            };

            service.updateScores("0", GameType.SIMPLE, GameMode.SOLO, "40:40", "name").then((outputMessage: IGameMessage) => {
                expect(outputMessage).to.deep.equal(NOT_TOP_MSG);
            }).catch();

        });

       it("#3.5 should call setScore if the score is a new best score", () => {
            setScoreStub = sinon.stub(gameService, "setScores").callsFake(async () => {
                return Promise.resolve();
            });

            service.updateScores("0", GameType.SIMPLE, GameMode.SOLO, "01:01", "name").then(() => {
                expect(setScoreStub.called).to.equal(true);
            }).catch();
        });

       it("#3.6 should not call setScore if the score is not a new best score", () => {
            setScoreStub = sinon.stub(gameService, "setScores").callsFake(async () => {
                return Promise.reject();
            });

            service.updateScores("0", GameType.SIMPLE, GameMode.SOLO, "40:40", "name").then(() => {
                expect(setScoreStub.called).to.equal(false);
            }).catch();
        });

       it("#3.7 should keep old score at best place if times are equal", () => {
            setScoreStub = sinon.stub(gameService, "setScores").callsFake(async () => {
                return Promise.resolve();
            });

            service.updateScores("0", GameType.SIMPLE, GameMode.SOLO, "10:10", "name").then(() => {
                const NEW_SCORES_INDEX: number = 2;
                const newScores: IScore[] = setScoreStub.lastCall.args[NEW_SCORES_INDEX] as IScore[];
                const EXPECTED_SCORES: IScore[] = [
                    { name: "name1", time: "10:10" },
                    { name: "name", time: "10:10" },
                    { name: "name2", time: "20:20" },
                ];
                expect(newScores).to.deep.equal(EXPECTED_SCORES);
            }).catch();
        });
    });

});
