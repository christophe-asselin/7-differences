import { Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

import { GameMode, GameType } from "../../../../common/GameEnum";
import { SocketEvent } from "../../../../common/SocketEvent";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { EndGameDialogComponent } from "../end-game-dialog/end-game-dialog.component";
import { SocketService } from "./socket.service";

@Injectable({
  providedIn: "root",
})
export class PopupService {

  private static readonly GAME_LIST_URL: string = "/games";

  private dialogRefMessage: MatDialogRef<EndGameDialogComponent>;
  private dialogRefConfirmation: MatDialogRef<ConfirmationDialogComponent>;

  public constructor(private dialog: MatDialog,
                     private router: Router,
                     private snackBar: MatSnackBar,
                     private socketService: SocketService) { }

  public openConfirmationDialog(action: string): void {
    this.dialogRefConfirmation = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
    });
    this.dialogRefConfirmation.componentInstance.action = action;
    this.dialogRefConfirmation.afterClosed().subscribe((result: Boolean) => {
      if (result) {
        // Don't resolve promise for navigating to url
        // tslint:disable-next-line: no-floating-promises
        this.router.navigateByUrl(PopupService.GAME_LIST_URL);
      }
    });
  }

  public openConfirmationLeaveGameDialog(action: string, idGame: string, type: GameType, nPlayers: GameMode): void {
    this.dialogRefConfirmation = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
    });
    this.dialogRefConfirmation.componentInstance.action = action;
    this.dialogRefConfirmation.afterClosed().subscribe((result: Boolean) => {
      if (result) {
        if (nPlayers === GameMode.DUO) {
          this.socketService.emitDuoGameEvent(SocketEvent.LEAVE_DUO_GAME, idGame, type);
        }
        this.socketService.modifyGame(SocketEvent.REMOVE_ON_GOING_GAME, idGame, type);
        // Don't resolve promise for navigating to url
        // tslint:disable-next-line: no-floating-promises
        this.router.navigateByUrl(PopupService.GAME_LIST_URL);
      }
    });
  }

  public openEndGameDialog(message: string): void {
    this.dialogRefMessage = this.dialog.open(EndGameDialogComponent, {
      disableClose: true,
    });
    this.dialogRefMessage.componentInstance.message = message;
    this.dialogRefMessage.afterClosed().subscribe(() => {
      // Don't resolve promise for navigating to url
      // tslint:disable-next-line: no-floating-promises
      this.router.navigateByUrl(PopupService.GAME_LIST_URL);
    });
  }

  public openModifyGameConfirmationDialog(event: SocketEvent, action: string, gameId: string, type: GameType): void {
    this.dialogRefConfirmation = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false,
    });
    this.dialogRefConfirmation.componentInstance.action = action;
    this.dialogRefConfirmation.afterClosed().subscribe((result: Boolean) => {
      if (result) {
        this.socketService.modifyGame(event, gameId, type);
      }
    });
  }

  public openSnackBar(message: string): void {
    this.snackBar.open(message, "OK", {
      verticalPosition: "top",
      panelClass: ["error-snack-bar"],
      duration: 4000,
    });
  }
}
