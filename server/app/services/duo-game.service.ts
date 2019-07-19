import { inject, injectable } from "inversify";
import "reflect-metadata";
import Types from "../types";

import { GameState, GameType } from "../../../common/GameEnum";
import { IDuoGame } from "../../../common/IDuoGame";
import { IDuoPlayer } from "../../../common/IDuoPlayer";
import { IUser } from "../../../common/IUser";
import { GameService } from "./game.service";

@injectable()
export class DuoGameService {

    private static readonly MAX_DIFFERENCE_DUO: number = 4;

    private duoGames: IDuoGame[];
    private idDuo: number;

    public constructor(@inject(Types.GameService) private gameService: GameService) {
        this.idDuo = 0;
        this.duoGames = [];
    }

    public getDuoGames(): IDuoGame[] {
        return this.duoGames;
    }

    public getDuoGame(username: string): IDuoGame {
        let game: IDuoGame = {idDuo: 0, idGame: "0", duoPlayers: [], identifiedDifferences: []};
        for (const aGame of this.duoGames) {
            aGame.duoPlayers.forEach((player: IDuoPlayer) => {
                if (player.user.username === username) {
                    game = aGame;
                }
            });
        }

        return game;
    }

    public async createDuoGame(idGame: string, type: GameType, user: IUser): Promise<IDuoGame> {
        return new Promise<IDuoGame>((resolve: (value: IDuoGame) => void) => {
            const idDuo: number = this.generateDuoID();
            const duoPlayer: IDuoPlayer = { user: user, nDiffFound: 0 };

            const duoGame: IDuoGame = {
                idDuo: idDuo,
                idGame: idGame,
                duoPlayers: [duoPlayer],
                identifiedDifferences: [],
            };
            this.duoGames.push(duoGame);

            this.gameService.setState(idGame, type, GameState.WAITING).then(() => {
                resolve(duoGame);
            }).catch(() => {
                resolve(duoGame);
            });
        });
    }

    public async joinGame(idGame: string, type: GameType, user: IUser): Promise<IDuoGame> {
        return new Promise<IDuoGame>((resolve: (value: IDuoGame) => void) => {
            let game: IDuoGame = {idDuo: 0, idGame: "0", duoPlayers: [], identifiedDifferences: []};
            for (const aGame of this.duoGames) {
                const hasWaitingPlayer: boolean = aGame.idGame === idGame && aGame.duoPlayers.length === 1;
                if (hasWaitingPlayer) {
                    const newDuoPlayer: IDuoPlayer = { user: user, nDiffFound: 0 };
                    aGame.duoPlayers.push(newDuoPlayer);
                    game = aGame;

                    this.gameService.setState(idGame, type, GameState.NOT_WAITING).then(() => {
                        resolve(game);
                    }).catch(() => {
                        resolve(game);
                    });
                }
            }
            resolve(game);
        });
    }

    public async deletePlayer(idGame: string, type: GameType, username: string): Promise<IDuoGame> {
        return new Promise<IDuoGame>((resolve: (value: IDuoGame) => void) => {
            let game: IDuoGame = {idDuo: 0, idGame: "0", duoPlayers: [], identifiedDifferences: []};
            for (const aGame of this.duoGames) {
                if (aGame.idGame === idGame) {
                    const index: number = aGame.duoPlayers.findIndex((player: IDuoPlayer) => player.user.username === username);
                    aGame.duoPlayers.splice(index, 1);
                    game = aGame;
                }
            }
            if (game.duoPlayers.length === 0) {
                this.removeDuoGame(game.idDuo);
                game = {idDuo: -1, idGame: idGame, duoPlayers: [], identifiedDifferences: []};
            }
            this.gameService.setState(idGame, type, GameState.NOT_WAITING).then(() => {
                resolve(game);
            }).catch(() => {
                resolve(game);
            });
        });
    }

    public simpleDifferenceFound(idDuo: number, username: string, url: string, identifiedDifferences: boolean[][]): IDuoGame {
        let game: IDuoGame = {idDuo: 0, idGame: "0", duoPlayers: [], identifiedDifferences: []};
        for (const aGame of this.duoGames) {
            if (aGame.idDuo === idDuo) {
                (aGame.duoPlayers.find((player: IDuoPlayer) => player.user.username === username) as IDuoPlayer).nDiffFound++;
                aGame.modifiedImageURL = url;
                aGame.identifiedDifferences = identifiedDifferences;
                game = aGame;
            }
        }

        return game;
    }

    public freeDifferenceFound(idDuo: number, username: string, index: number): IDuoGame {
        let game: IDuoGame = {idDuo: 0, idGame: "0", duoPlayers: []};
        for (const aGame of this.duoGames) {
            if (aGame.idDuo === idDuo) {
                (aGame.duoPlayers.find((player: IDuoPlayer) => player.user.username === username) as IDuoPlayer).nDiffFound++;
                aGame.object3DIndex = index;
                game = aGame;
            }
        }

        return game;
    }

    public findRooms(idGame: string): string[] {
        const startRoom: string = idGame + "/";
        const rooms: string[] = [];
        for (const aGame of this.duoGames) {
            if (aGame.idGame === idGame) {
                rooms.push(startRoom + aGame.idDuo);
            }
        }

        return rooms;
    }

    public checkIfEndDuoGame(idDuo: number): IUser[] {
        const users: IUser[] = [];
        let game: IDuoGame = this.duoGames[0];
        this.duoGames.forEach((aGame: IDuoGame) => {
            if (aGame.idDuo === idDuo) {
                game = aGame;
            }
        });
        if (game.duoPlayers[0].nDiffFound === DuoGameService.MAX_DIFFERENCE_DUO) {
            users.push(game.duoPlayers[0].user); // Winner
            users.push(game.duoPlayers[1].user); // Loser
            this.removeDuoGame(idDuo);
        } else if (game.duoPlayers[1].nDiffFound === DuoGameService.MAX_DIFFERENCE_DUO) {
            users.push(game.duoPlayers[1].user); // Winner
            users.push(game.duoPlayers[0].user); // Loser
            this.removeDuoGame(idDuo);
        }

        return users;
    }

    private removeDuoGame(idDuo: number): void {
        const index: number = this.duoGames.findIndex((game: IDuoGame) => game.idDuo === idDuo);
        this.duoGames.splice(index, 1);
    }

    private generateDuoID(): number {
        return this.idDuo++;
    }

}
