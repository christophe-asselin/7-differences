import { injectable } from "inversify";
import "reflect-metadata";

import { MongoError } from "mongodb";
import { Document } from "mongoose";
import { Game3D } from "../../../client/src/app/game3-d/Game3D";
import { GameMode, GameState, GameType } from "../../../common/GameEnum";
import { IFreeGame } from "../../../common/IFreeGame";
import { INewSimpleGameInfos } from "../../../common/INewSimpleGameInfos";
import { IScore } from "../../../common/IScore";
import { ISimpleGame } from "../../../common/ISimpleGame";
import freeGameModel from "./Model/IFreeGame.model";
import simpleGameModel from "./Model/ISimpleGame.model";
import { BestScoreService } from "./best-score.service";

@injectable()
export class GameService {

  public async getGame(id: string, type: GameType): Promise<ISimpleGame | IFreeGame> {
    return (type === GameType.SIMPLE) ? this.getSimpleGame(id) : this.getFreeGame(id);
  }

  private async getSimpleGame(id: string): Promise<ISimpleGame> {
    return new Promise<ISimpleGame>((resolve: (game: ISimpleGame) => void) => {
      simpleGameModel.findById(id).then((res: (ISimpleGame & Document)) => {
        resolve(res);
      }).catch(() => { return; });
    });
  }

  private async getFreeGame(id: string): Promise<IFreeGame> {
    return new Promise<IFreeGame>((resolve: (game: IFreeGame) => void) => {
      freeGameModel.findById(id).then((res: (IFreeGame & Document)) => {
        resolve(res);
      }).catch(() => { return; });
    });
  }

  public async getGames(type: GameType): Promise<ISimpleGame[] | IFreeGame[]> {
    return (type === GameType.SIMPLE) ? this.getSimpleGames() : this.getFreeGames();
  }

  private async getSimpleGames(): Promise<ISimpleGame[]> {
    return new Promise<ISimpleGame[]>((resolve: (games: ISimpleGame[]) => void) => {
      simpleGameModel.find({}, {"name": 1, "type": 1, "originalImageURL": 1, "scoreSolo": 1, "scoreDuo": 1, "state": 1}).then(
        (res: (ISimpleGame & Document)[]) => {
        resolve(res as ISimpleGame[]);
      }).catch(() => {
        resolve([]);
      });
    });
  }

  private async getFreeGames(): Promise<IFreeGame[]> {
    return new Promise<IFreeGame[]>((resolve: (games: IFreeGame[]) => void) => {
      freeGameModel.find({}, {"name": 1, "type": 1, "originalImageURL": 1, "scoreSolo": 1, "scoreDuo": 1, "state": 1}).then(
        (res: (IFreeGame & Document)[]) => {
        resolve(res as IFreeGame[]);
      }).catch(() => {
        resolve([]);
      });
    });
  }

  public async setScores(game: ISimpleGame | IFreeGame, nPlayers: string, newScores: IScore[]): Promise<void> {
    const sortedNewScores: IScore[] = BestScoreService.sortScore(newScores);

    return game.type === GameType.SIMPLE ?
      this.setSimpleScores(game as ISimpleGame, nPlayers, sortedNewScores)
        : this.setFreeScores(game as IFreeGame, nPlayers, sortedNewScores);
  }

  private async setSimpleScores(game: ISimpleGame, nPlayers: string, newScores: IScore[]): Promise<void> {
    const updatedScore: Object = (nPlayers === GameMode.SOLO) ? { scoreSolo: newScores } : { scoreDuo: newScores };

    return new Promise<void>((resolve: () => void) => {
      simpleGameModel.findByIdAndUpdate(game._id, updatedScore, () => {
        resolve();
      });
    });
  }

  private async setFreeScores(game: IFreeGame, nPlayers: string, newScores: IScore[]): Promise<void> {
    const updatedScore: Object = (nPlayers === GameMode.SOLO) ? { scoreSolo: newScores } : { scoreDuo: newScores };

    return new Promise<void>((resolve: () => void) => {
      freeGameModel.findByIdAndUpdate(game._id, updatedScore, () => {
        resolve();
      });
    });
  }

  public async setState(id: string, type: GameType, state: GameState): Promise<void> {
    return type === GameType.SIMPLE ? this.setStateSimpleGame(id, state) : this.setStateFreeGame(id, state);
  }

  private async setStateSimpleGame(id: string, state: GameState): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
      simpleGameModel.findByIdAndUpdate(id, { state: state }, () => {
        resolve();
      });
    });
  }

  private async setStateFreeGame(id: string, state: GameState): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
      freeGameModel.findByIdAndUpdate(id, { state: state }, () => {
        resolve();
      });
    });
  }

  public async addSimpleGame(game: INewSimpleGameInfos): Promise<ISimpleGame[]> {

    const newGame: Object = this.createSimpleGame(game);
    const createdGame: ISimpleGame & Document = new simpleGameModel(newGame);

    return createdGame.save().then(async () => {
      return this.getSimpleGames();
    }).catch(async () => {
      return this.getSimpleGames();
    });
  }

  public async addFreeGame(game: Game3D)
  : Promise<IFreeGame[]> {
    const newGame: Object = this.createFreeGame(game);
    const createdGame: IFreeGame & Document = new freeGameModel(newGame);

    return createdGame.save().then(async () => {
      return this.getFreeGames();
    }).catch(async () => {
      return this.getFreeGames();
    });
  }

  public async removeGame(id: string, type: GameType): Promise<ISimpleGame[] | IFreeGame[]> {
    return type === GameType.SIMPLE ? this.removeSimpleGame(id) : this.removeFreeGame(id);
  }

  private async removeSimpleGame(id: string): Promise<ISimpleGame[]> {
    return new Promise<ISimpleGame[]>((resolve: (value: ISimpleGame[]) => void) => {
      simpleGameModel.findByIdAndDelete(id, (err: MongoError, game: (ISimpleGame & Document)) => {
        this.getSimpleGames().then((games: ISimpleGame[]) => {
          resolve(games);
        }).catch(() => {
          resolve([]);
        });
      });
    });
  }

  private async removeFreeGame(id: string): Promise<IFreeGame[]> {
    return new Promise<IFreeGame[]>((resolve: (value: IFreeGame[]) => void) => {
      freeGameModel.findByIdAndDelete(id, () => {
        this.getFreeGames().then((games: IFreeGame[]) => {
          resolve(games);
        }).catch(() => {
          resolve([]);
        });
      });
    });
  }

  public async resetScore(id: string, type: GameType): Promise<ISimpleGame[] | IFreeGame[]> {
    return type === GameType.SIMPLE ? this.resetSimpleScore(id) : this.resetFreeScore(id);
  }

  private async resetSimpleScore(id: string): Promise<ISimpleGame[]> {
    const updatedScores: Object = {
      scoreSolo: BestScoreService.generateRandomScore(),
      scoreDuo: BestScoreService.generateRandomScore(),
    };

    return new Promise<ISimpleGame[]>((resolve: (result: ISimpleGame[]) => void) => {
      simpleGameModel.findByIdAndUpdate(id, updatedScores, () => {
        this.getSimpleGames().then((games: ISimpleGame[]) => {
          resolve(games);
        }).catch(() => {
          resolve([]);
        });
      });
    });
  }

  private async resetFreeScore(id: string): Promise<IFreeGame[]> {
    const updatedScores: Object = {
      scoreSolo: BestScoreService.generateRandomScore(),
      scoreDuo: BestScoreService.generateRandomScore(),
    };

    return new Promise<IFreeGame[]>((resolve: (result: IFreeGame[]) => void) => {
      freeGameModel.findByIdAndUpdate(id, updatedScores, () => {
        this.getFreeGames().then((games: IFreeGame[]) => {
          resolve(games);
        }).catch(() => {
          resolve([]);
        });
      });
    });
  }

  private createSimpleGame(game: INewSimpleGameInfos): Object {
    const defaultSoloScore: IScore[] = BestScoreService.generateRandomScore();
    const defaultDuoScore: IScore[] = BestScoreService.generateRandomScore();

    return {
      name: game.name,
      type: GameType.SIMPLE,
      originalImageURL: game.originalImage,
      modifiedImageURL: game.modifiedImage,
      differenceRegions: game.differenceRegions,
      scoreSolo: defaultSoloScore,
      scoreDuo: defaultDuoScore,
      state: GameState.NOT_WAITING,
    };
  }

  private createFreeGame(game3D: Game3D): Object {
    const defaultSoloScore: IScore[] = BestScoreService.generateRandomScore();
    const defaultDuoScore: IScore[] = BestScoreService.generateRandomScore();

    return {
      name: game3D.name,
      type: GameType.FREE,
      game3Dtype: game3D.type,
      originalImageURL: game3D.originalImageURL,
      scoreSolo: defaultSoloScore,
      scoreDuo: defaultDuoScore,
      originalObjects: game3D.originalObjects,
      modifiedObjects: game3D.modifiedObjects,
      state: GameState.NOT_WAITING,
    };
  }

}
