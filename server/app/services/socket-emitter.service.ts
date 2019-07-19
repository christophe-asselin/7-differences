import { inject, injectable } from "inversify";
import "reflect-metadata";
import { IUser } from "../../../common/IUser";
import Types from "../types";
import { BestScoreService } from "./best-score.service";
import { GameService } from "./game.service";
import { UserService } from "./user.service";

import { Game3D } from "../../../client/src/app/game3-d/Game3D";
import { GameEvent, GameMode, GameType } from "../../../common/GameEnum";
import { IDuoGame } from "../../../common/IDuoGame";
import { IFreeGame } from "../../../common/IFreeGame";
import { IGameMessage } from "../../../common/IGameMessage";
import { INewSimpleGameInfos } from "../../../common/INewSimpleGameInfos";
import { ISimpleGame } from "../../../common/ISimpleGame";
import { SocketEvent } from "../../../common/SocketEvent";
import { Title } from "../../../common/communication/TitleEnum";
import { Message } from "../../../common/communication/message";
import { DuoGameService } from "./duo-game.service";
import { OnGoingGameService } from "./on-going-game.service";

@injectable()
export class SocketEmitterService {

    private static readonly DELAY: number = 1000;

    private io: SocketIO.Server;

    public constructor(@inject(Types.UserService) private userService: UserService,
                       @inject(Types.GameService) private gameService: GameService,
                       @inject(Types.BestScoreService) private bestScoreService: BestScoreService,
                       @inject(Types.DuoGameService) private duoGameService: DuoGameService,
                       @inject(Types.OnGoingGameService) private onGoingGameService: OnGoingGameService) { }

    public initSocket(io: SocketIO.Server): void {
        this.io = io;
    }

    public newUser(user: IUser): void {
        this.userService.setId(user.userId, user.username).then(() => {
            const message: IGameMessage = {username: user.username, event: GameEvent.CONNECT};
            this.io.emit(SocketEvent.NEW_MESSAGE, message);
        }).catch(() => { return; /* fail silently */ });
    }

    public disconnect(socket: SocketIO.Socket): void {
        setTimeout(() => {
            this.userService.removeUser(socket.id).then((name: string) => {
                if (name !== "") {
                    const message: IGameMessage = {username: name, event: GameEvent.DISCONNECT};
                    this.io.emit(SocketEvent.NEW_MESSAGE, message);
                }
            }).catch(() => { return; /* fail silently */ });
        },         SocketEmitterService.DELAY);
    }

    public newMessage(socket: SocketIO.Socket, message: IGameMessage, idGame: string, idDuo: number): void {
        const room: string = (message.nPlayers === GameMode.SOLO ? socket.id : this.generateRoomName(idGame, idDuo));
        this.io.to(room).emit(SocketEvent.NEW_MESSAGE, message);
    }

    public createDuoGame(socket: SocketIO.Socket, idGame: string, type: GameType, user: IUser): void {
        this.duoGameService.createDuoGame(idGame, type, user).then((duoGame: IDuoGame) => {
            socket.join(this.generateRoomName(idGame, duoGame.idDuo));

            const message: Message = {title: Title.WAITING, body: idGame};
            this.io.emit(this.getUpdateGameStateEvent(type), message);
        }).catch(() => { return; /* fail silently */ });
    }

    public joinDuoGame(socket: SocketIO.Socket, idGame: string, type: GameType, user: IUser): void {
        this.duoGameService.joinGame(idGame, type, user).then((duoGame: IDuoGame) => {
            socket.join(this.generateRoomName(idGame, duoGame.idDuo));
            this.io.to(this.generateRoomName(idGame, duoGame.idDuo)).emit(SocketEvent.NEW_DUO_PLAYER);

            const message: Message = {title: Title.NOT_WAITING, body: idGame};
            this.io.emit(this.getUpdateGameStateEvent(type), message);
        }).catch(() => { return; /* fail silently */ });
    }

    public leaveDuoGame(socket: SocketIO.Socket, idGame: string, type: GameType, user: IUser): void {
        const message: Message = {title: Title.NOT_WAITING, body: idGame};
        this.io.emit(this.getUpdateGameStateEvent(type), message);

        this.duoGameService.deletePlayer(idGame, type, user.username).then((game: IDuoGame) => {
            const room: string = this.generateRoomName(idGame, game.idDuo);
            socket.leave(room);

            this.io.to(room).emit(SocketEvent.QUIT_DUO_GAME);
        }).catch(() => { return; /* fail silently */ });
    }

    public simpleDifferenceFound(idDuo: number, username: string, newURL: string, identifiedDifferences: boolean[][]): void {
        const game: IDuoGame = this.duoGameService.simpleDifferenceFound(idDuo, username, newURL, identifiedDifferences);
        this.io.to(this.generateRoomName(game.idGame, idDuo)).emit(SocketEvent.SIMPLE_DIFFERENCE_FOUND, game);
        this.checkEndGame(idDuo);
    }

    public freeDifferenceFound(idDuo: number, username: string, index: number): void {
        const game: IDuoGame = this.duoGameService.freeDifferenceFound(idDuo, username, index);
        this.io.to(this.generateRoomName(game.idGame, idDuo)).emit(SocketEvent.FREE_DIFFERENCE_FOUND, game);
        this.checkEndGame(idDuo);
    }

    public newScore(idGame: string, type: GameType, nPlayers: GameMode, timeString: string, username: string): void {
        this.bestScoreService.updateScores(idGame, type, nPlayers, timeString, username).then((message: IGameMessage) => {
            if (message.position !== "") {
                this.io.emit(SocketEvent.NEW_MESSAGE, message);
            }
            this.gameService.getGames(type).then((games: ISimpleGame[] | IFreeGame[]) => {
                this.io.emit(this.getUpdateGamesEvent(type), games);
            }).catch(() => { return; /* fail silently */});
        }).catch(() => { return; /* fail silently */ });
    }

    public newSimpleGame(game: INewSimpleGameInfos): void {
        this.gameService.addSimpleGame(game).then((simpleGames: ISimpleGame[]) => {
            this.io.emit(SocketEvent.UPDATE_SIMPLE_GAMES, simpleGames);
        }).catch(() => { return; /* fail silently */ } );
    }

    public newFreeGame(game: Game3D): void {
        this.gameService.addFreeGame(game).then((freeGames: IFreeGame[]) => {
            this.io.emit(SocketEvent.UPDATE_FREE_GAMES, freeGames);
        }).catch(() => { return; /* fail silently */ });
    }

    public removeGame(id: string, type: GameType): void {
        this.duoGameService.findRooms(id).forEach((room: string) => {
            this.io.to(room).emit(SocketEvent.REMOVE_GAME);
        });
        this.gameService.removeGame(id, type).then((games: ISimpleGame[] | IFreeGame[]) => {
            this.io.emit(this.getUpdateGamesEvent(type), games);
        }).catch(() => { return; } /* fail silently */);
    }

    public resetScores(id: string, type: GameType): void {
        this.gameService.resetScore(id, type).then((games: IFreeGame[] | ISimpleGame[]) => {
            this.io.emit(this.getUpdateGamesEvent(type), games);
        }).catch(() => { return; /* fail silently */ });
    }

    public newOnGoingGame(game: ISimpleGame | IFreeGame): void {
        this.onGoingGameService.addOnGoingGame(game);
    }

    public removeOnGoingGame(id: string, type: GameType): void {
        this.onGoingGameService.removeOnGoingGame(id, type);
    }

    private getUpdateGamesEvent(type: GameType): SocketEvent {
        return (type === GameType.SIMPLE ? SocketEvent.UPDATE_SIMPLE_GAMES : SocketEvent.UPDATE_FREE_GAMES);
    }

    private getUpdateGameStateEvent(type: GameType): SocketEvent {
        return (type === GameType.SIMPLE ? SocketEvent.UPDATE_SIMPLE_GAME_STATE : SocketEvent.UPDATE_FREE_GAME_STATE);
    }

    private generateRoomName(idGame: string, idDuo: number): string {
        return idGame + "/" + idDuo;
    }

    private checkEndGame(idDuo: number): void {
        const users: IUser[] = this.duoGameService.checkIfEndDuoGame(idDuo);
        if (users.length !== 0) {
            this.io.to(users[0].userId).emit(SocketEvent.END_DUO_GAME, {title: Title.WINNER, body: "Félicitation vous avez gagné!"});
            this.io.to(users[1].userId).emit(SocketEvent.END_DUO_GAME,
                                             {title: Title.LOSER, body: "Vous avez perdu! Veuillez retenter votre chance!"});
        }
    }

}
