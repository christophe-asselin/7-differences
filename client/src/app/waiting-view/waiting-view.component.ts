import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { GameService } from "../services/game.service";

import { Subscription } from "rxjs";
import { GameMode, GameType } from "../../../../common/GameEnum";
import { IFreeGame } from "../../../../common/IFreeGame";
import { ISimpleGame } from "../../../../common/ISimpleGame";
import { SocketEvent } from "../../../../common/SocketEvent";
import { PopupService } from "../services/popup.service";
import { SocketService } from "../services/socket.service";

@Component({
  selector: "app-waiting-view",
  templateUrl: "./waiting-view.component.html",
  styleUrls: ["./waiting-view.component.css"],
})
export class WaitingViewComponent implements OnInit, OnDestroy {

  public currentGame: ISimpleGame | IFreeGame;
  private type: GameType;

  private onNewDuoPlayer: Subscription;
  private onRemoveGame: Subscription;

  public constructor(private route: ActivatedRoute,
                     private router: Router,
                     private gameService: GameService,
                     private socketService: SocketService,
                     private popupService: PopupService) {
    this.initGame();
  }

  public ngOnInit(): void {
    this.onNewDuoPlayer = this.socketService.onEvent<void>(SocketEvent.NEW_DUO_PLAYER).subscribe(() => {
      this.router.navigateByUrl("/games/" + this.currentGame.type + "/" + GameMode.DUO + "/" + this.currentGame._id).catch();
    });
    this.onRemoveGame = this.socketService.onEvent<void>(SocketEvent.REMOVE_GAME).subscribe(() => {
      this.socketService.modifyGame(SocketEvent.REMOVE_ON_GOING_GAME, this.currentGame._id, GameType.SIMPLE);
      this.popupService.openSnackBar("Le jeu \"" + this.currentGame.name + "\" n'est plus disponible.");
      this.router.navigateByUrl("/games").catch();
    });
  }

  public ngOnDestroy(): void {
    this.onNewDuoPlayer.unsubscribe();
    this.onRemoveGame.unsubscribe();
  }

  public cancelNewGame(): void {
    try {
      this.socketService.emitDuoGameEvent(SocketEvent.LEAVE_DUO_GAME, this.currentGame._id, this.currentGame.type);
      this.router.navigateByUrl("/games").catch();
    } catch (err) {
      this.popupService.openSnackBar("Veuillez patienter SVP");
    }
  }

  private initGame(): void {
    this.route.params.subscribe((params: Params) => {
      this.type = params["type"];
      this.getGame(params["id"], this.type);
    });
  }

  private getGame(id: string, type: GameType): void {
    this.gameService.getGame(id, type, GameMode.SOLO).subscribe((game: ISimpleGame | IFreeGame) => {
      this.currentGame = game;
      this.socketService.emitDuoGameEvent(SocketEvent.CREATE_DUO_GAME, id, type);
      this.socketService.addGame<ISimpleGame | IFreeGame>(SocketEvent.NEW_ON_GOING_GAME, game);
    });
  }

  @HostListener("window:beforeunload", ["$event"])
  public disconnect(event: Event): void {
    setTimeout(() => {
      window.location.href = "/connect";
      event.returnValue = false;
    });
  }

}
