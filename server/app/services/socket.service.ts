import { inject, injectable } from "inversify";
import "reflect-metadata";
import { Game3D } from "../../../client/src/app/game3-d/Game3D";
import { IUser } from "../../../common/IUser";
import Types from "../types";

import { GameMode, GameType } from "../../../common/GameEnum";
import { IFreeGame } from "../../../common/IFreeGame";
import { IGameMessage } from "../../../common/IGameMessage";
import { INewSimpleGameInfos } from "../../../common/INewSimpleGameInfos";
import { ISimpleGame } from "../../../common/ISimpleGame";
import { SocketEvent } from "../../../common/SocketEvent";
import { SocketEmitterService } from "./socket-emitter.service";

@injectable()
export class SocketService {

    private io: SocketIO.Server;

    public constructor(@inject(Types.SocketEmitterService) private socketEmitterService: SocketEmitterService) { }

    public initSocket(io: SocketIO.Server): void {
        this.io = io;
        this.socketEmitterService.initSocket(this.io);

        this.io.on(SocketEvent.CONNECT, (socket: SocketIO.Socket) => {
            socket.on(SocketEvent.NEW_USER, (user: IUser) => {
                this.socketEmitterService.newUser(user);
            });

            socket.on(SocketEvent.DISCONNECT, () => {
                this.socketEmitterService.disconnect(socket);
            });

        });

        this.gameListener();
        this.duoGameListener();
        this.onGoingGameListener();

    }

    private gameListener(): void {
        this.io.on(SocketEvent.CONNECT, (socket: SocketIO.Socket) => {
            socket.on(SocketEvent.NEW_SIMPLE_GAME, (game: INewSimpleGameInfos) => {
                this.socketEmitterService.newSimpleGame(game);
            });

            socket.on(SocketEvent.NEW_FREE_GAME, (game: Game3D) => {
                this.socketEmitterService.newFreeGame(game);
            });

            socket.on(SocketEvent.REMOVE_GAME, (id: string, type: GameType) => {
                this.socketEmitterService.removeGame(id, type);
            });

            socket.on(SocketEvent.RESET_SCORES, (id: string, type: GameType) => {
                this.socketEmitterService.resetScores(id, type);
            });
        });
    }

    private duoGameListener(): void {
        this.io.on(SocketEvent.CONNECT, (socket: SocketIO.Socket) => {
            socket.on(SocketEvent.NEW_MESSAGE, (message: IGameMessage, idGame: string, idDuo: number) => {
                this.socketEmitterService.newMessage(socket, message, idGame, idDuo);
            });
            socket.on(SocketEvent.CREATE_DUO_GAME, (idGame: string, type: GameType, user: IUser) => {
                this.socketEmitterService.createDuoGame(socket, idGame, type, user);
            });
            socket.on(SocketEvent.JOIN_DUO_GAME, (idGame: string, type: GameType, user: IUser) => {
                this.socketEmitterService.joinDuoGame(socket, idGame, type, user);
            });
            socket.on(SocketEvent.SIMPLE_DIFFERENCE_FOUND,
                      (idDuo: number, username: string, newURL: string, identifiedDifferences: boolean[][]) => {
                this.socketEmitterService.simpleDifferenceFound(idDuo, username, newURL, identifiedDifferences);
            });
            socket.on(SocketEvent.FREE_DIFFERENCE_FOUND, (idDuo: number, username: string, index: number) => {
                this.socketEmitterService.freeDifferenceFound(idDuo, username, index);
            });
            socket.on(SocketEvent.NEW_SCORE, (idGame: string, type: GameType, nPlayers: GameMode, timeString: string, username: string) => {
                this.socketEmitterService.newScore(idGame, type, nPlayers, timeString, username);
            });
            socket.on(SocketEvent.LEAVE_DUO_GAME, (idGame: string, type: GameType, user: IUser) => {
                this.socketEmitterService.leaveDuoGame(socket, idGame, type, user);
            });

        });

    }

    private onGoingGameListener(): void {
        this.io.on(SocketEvent.CONNECT, (socket: SocketIO.Socket) => {
            socket.on(SocketEvent.NEW_ON_GOING_GAME, (game: ISimpleGame | IFreeGame) => {
                this.socketEmitterService.newOnGoingGame(game);
            });

            socket.on(SocketEvent.REMOVE_ON_GOING_GAME, (id: string, type: GameType) => {
                this.socketEmitterService.removeOnGoingGame(id, type);
            });
        });
    }
}
