import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Game3D } from "../game3-d/Game3D";
import { GameService } from "../services/game.service";
import { SocketService } from "../services/socket.service";

import { Subscription } from "rxjs";
import { GameMode, GameState, GameType } from "../../../../common/GameEnum";
import { IFreeGame } from "../../../../common/IFreeGame";
import { INewSimpleGameInfos } from "../../../../common/INewSimpleGameInfos";
import { ISimpleGame } from "../../../../common/ISimpleGame";
import { IUser } from "../../../../common/IUser";
import { SocketEvent } from "../../../../common/SocketEvent";
import { Title } from "../../../../common/communication/TitleEnum";
import { Message } from "../../../../common/communication/message";
import { PopupService } from "../services/popup.service";

@Component({
  selector: "app-games-list-view",
  templateUrl: "./games-list-view.component.html",
  styleUrls: ["./games-list-view.component.css"],
})
export class GamesListViewComponent implements OnInit, OnDestroy {

  public simpleGames: ISimpleGame[];
  public freeGames: IFreeGame[];
  public currentUser: IUser;
  public href: string;

  private onUpdateSimpleGames: Subscription;
  private onUpdateFreeGames: Subscription;
  private onUpdateSimpleGameState: Subscription;
  private onUpdateFreeGameState: Subscription;

  public constructor(private router: Router,
                     private gameService: GameService,
                     private socketService: SocketService,
                     private popupService: PopupService) {
    this.href = this.router.url;
    this.simpleGames = [];
    this.freeGames = [];
    this.currentUser = this.socketService.getUser();
    this.initGames();
  }

  public ngOnInit(): void {
    this.onUpdateSimpleGames = this.socketService.onEvent<ISimpleGame[]>(SocketEvent.UPDATE_SIMPLE_GAMES)
    .subscribe((games: ISimpleGame[]) => {
      this.simpleGames = games;
    });
    this.onUpdateFreeGames = this.socketService.onEvent<IFreeGame[]>(SocketEvent.UPDATE_FREE_GAMES)
    .subscribe((games: IFreeGame[]) => {
      this.freeGames = games;
    });
    this.onUpdateSimpleGameState = this.socketService.onEvent<Message>(SocketEvent.UPDATE_SIMPLE_GAME_STATE)
    .subscribe((message: Message) => {
      const index: number = this.simpleGames.findIndex((game: ISimpleGame) => game._id === message.body);
      this.simpleGames[index].state = (message.title === Title.WAITING) ? GameState.WAITING : GameState.NOT_WAITING;
    });
    this.onUpdateFreeGameState = this.socketService.onEvent<Message>(SocketEvent.UPDATE_FREE_GAME_STATE)
    .subscribe((message: Message) => {
      const index: number = this.freeGames.findIndex((game: IFreeGame) => game._id === message.body);
      this.freeGames[index].state = (message.title === Title.WAITING) ? GameState.WAITING : GameState.NOT_WAITING;
    });
  }

  public ngOnDestroy(): void {
    this.onUpdateSimpleGames.unsubscribe();
    this.onUpdateFreeGames.unsubscribe();
    this.onUpdateSimpleGameState.unsubscribe();
    this.onUpdateFreeGameState.unsubscribe();
  }

  public onPlayClick(gameId: string, type: GameType): void {
    this.router.navigateByUrl("/games/" + type + "/" + GameMode.SOLO + "/" + gameId).catch();
  }

  public onCreateClick(gameId: string, type: GameType): void {
    this.router.navigateByUrl("/games/waiting/" + type + "/" + gameId).catch();
  }

  public onJoinClick(gameId: string, type: GameType): void {
    this.socketService.emitDuoGameEvent(SocketEvent.JOIN_DUO_GAME, gameId, type);
    this.router.navigateByUrl("/games/" + type + "/" + GameMode.DUO + "/" + gameId).catch();
  }

  public onRemoveClick(gameId: string, type: GameType): void {
    this.popupService.openModifyGameConfirmationDialog(SocketEvent.REMOVE_GAME, "supprimer", gameId, type);
  }

  public onResetClick(gameId: string, type: GameType): void {
    this.popupService.openModifyGameConfirmationDialog(SocketEvent.RESET_SCORES, "réinitialiser", gameId, type);
  }

  public createSimpleGame(newGameInfo: INewSimpleGameInfos): void {

    const fileReaderOriginal: FileReader = new FileReader();
    const fileReaderModified: FileReader = new FileReader();

    fileReaderOriginal.readAsDataURL(newGameInfo.originalImage as File);
    fileReaderOriginal.onload = ((): void => {
      fileReaderModified.readAsDataURL(newGameInfo.modifiedImage as File);
      fileReaderModified.onload = ((): void => {
        const filesAreOfCorrectFormat: boolean = typeof fileReaderOriginal.result === "string" &&
                                                typeof fileReaderModified.result === "string";
        if (filesAreOfCorrectFormat) {
          newGameInfo.originalImage = fileReaderOriginal.result as string;
          newGameInfo.modifiedImage = fileReaderModified.result as string;
          this.socketService.addGame<INewSimpleGameInfos>(SocketEvent.NEW_SIMPLE_GAME, newGameInfo);
        }
      });

    });
  }

  public createFreeGame(newGameInfo: Game3D): void {
    this.socketService.addGame<Game3D>(SocketEvent.NEW_FREE_GAME, newGameInfo);
  }

  public initGames(): void {
    this.gameService.getGames(GameType.SIMPLE).subscribe((games: ISimpleGame[]) => {
      this.simpleGames = games;
    });
    this.gameService.getGames(GameType.FREE).subscribe((games: IFreeGame[]) => {
      this.freeGames = games;
    });
  }

  @HostListener("window:beforeunload", ["$event"])
  public disconnect(event: Event): void {
    if (this.href === "/games") {
      setTimeout(() => {
        window.location.href = "/connect";
        event.returnValue = false;
      });
    }
  }

}
