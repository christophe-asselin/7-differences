import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as socketIo from "socket.io-client";

import { GameType } from "../../../../common/GameEnum";
import { IGameMessage } from "../../../../common/IGameMessage";
import { IUser } from "../../../../common/IUser";
import { SocketEvent } from "../../../../common/SocketEvent";
import { ServerUrlService } from "./server-url.service";

@Injectable({
  providedIn: "root",
})
export class SocketService {

  private socket: SocketIOClient.Socket;
  private user: IUser;

  public constructor() {
    this.socket = socketIo(ServerUrlService.URL);
  }

  public getSocket(): SocketIOClient.Socket {
    return this.socket ;
  }

  public getUser(): IUser {
    return this.user;
  }

  public initSocket(username: string): void {
    this.user = {userId: "/#" + this.socket.id, username: username};
    this.socket.emit(SocketEvent.NEW_USER, this.user);
  }

  public onEvent<T>(event: SocketEvent): Observable<T> {
    return new Observable<T>((observer) => {
      this.socket.on(event, (item: T) => observer.next(item));
    });
  }

  public onceEvent<T>(event: SocketEvent): Observable<T> {
    return new Observable<T>((observer) => {
      this.socket.once(event, (item: T) => observer.next(item));
    });
  }

  public sendPrivateMessage(message: IGameMessage, idGame: string, idDuo: number): void {
    message.username = this.user.username;
    this.socket.emit(SocketEvent.NEW_MESSAGE, message, idGame, idDuo);
  }

  // CREATE, JOIN or LEAVE DUOGAME
  public emitDuoGameEvent(event: SocketEvent, idGame: string, type: GameType): void {
    this.socket.emit(event, idGame, type, this.user);
  }

  public simpleDifferenceFound(idDuo: number, newURL: string, identifiedDifferences: boolean[][]): void {
    this.socket.emit(SocketEvent.SIMPLE_DIFFERENCE_FOUND, idDuo, this.user.username,  newURL, identifiedDifferences);
  }

  public freeDifferenceFound(idDuo: number, index: number): void {
    this.socket.emit(SocketEvent.FREE_DIFFERENCE_FOUND, idDuo, this.user.username,  index);
  }

  public checkIfNewBestScore(idGame: string, type: GameType, nPlayers: string, timeString: string): void {
    this.socket.emit(SocketEvent.NEW_SCORE, idGame, type, nPlayers, timeString, this.user.username);
  }

  // ADD NEW GAME or ADD ON GOING GAME
  public addGame<T>(event: SocketEvent, game: T): void {
    this.socket.emit(event, game);
  }

  // REMOVE GAME/ON GOING GAME or RESET SCORES
  public modifyGame(event: SocketEvent, idGame: string, type: GameType): void {
    this.socket.emit(event, idGame, type);
  }

}
