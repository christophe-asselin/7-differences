import { TestBed } from "@angular/core/testing";

import { MatDialog, MatDialogRef, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import { Router } from "@angular/router";
import { of, Observable } from "rxjs";
import { GameMode, GameType } from "../../../../common/GameEnum";
import { SocketEvent } from "../../../../common/SocketEvent";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { PopupService } from "./popup.service";
import { SocketService } from "./socket.service";

class MatDialogRefStub<T> {
  public componentInstance: Object;

  public constructor() {
    this.componentInstance = { action: "", message: "" };
  }

  public afterClosed(): Observable<boolean> {
    return of(true);
  }
}

describe("PopupService", () => {
  const GAME_LIST_URL: string = "/games";
  const GAME_ID: string = "1";

  let popupService: PopupService;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;
  let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let socketServiceSpy: jasmine.SpyObj<SocketService>;

  let action: string;
  let type: GameType;

  beforeEach(() => {
    matDialogSpy = jasmine.createSpyObj("MatDialog", ["open"] );
    routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
    matSnackBarSpy = jasmine.createSpyObj("MatSnackBar", ["open"]);
    socketServiceSpy = jasmine.createSpyObj("SocketService", ["emitDuoGameEvent", "modifyGame"]);
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: matDialogSpy },
                  { provide: Router, useValue: routerSpy },
                  { provide: MatSnackBar, useValue: matSnackBarSpy },
                  { provide: MatDialogRef, useClass: MatDialogRefStub },
                  { provide: SocketService, useValue: socketServiceSpy}],
    });
    popupService = TestBed.get(PopupService);
  });

  it("should be created", () => {
    expect(popupService).toBeTruthy();
  });

  describe("#1 openConfirmationDialog(action: string)", () => {
    it("#1.1 should call navigateByUrl on router to go back to games list when dialog is closed", () => {
      matDialogSpy.open.and.returnValue(new MatDialogRefStub());
      popupService.openConfirmationDialog("test action");
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(GAME_LIST_URL);
    });
  });

  describe("#2 openConfirmationLeaveGameDialog(action: string, idGame: string, type: GameType, nPlayers: GameMode)", () => {
    let nPlayer: GameMode;

    action = "quitter";

    it("#2.1 should open a ConfirmationDialogComponent, emit a removeOnGoingGame message and return to the GameListView", () => {
      type = GameType.FREE;
      nPlayer = GameMode.SOLO;

      matDialogSpy.open.and.returnValue(new MatDialogRefStub());
      popupService.openConfirmationLeaveGameDialog(action, GAME_ID, type, nPlayer);

      expect(matDialogSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {disableClose: true});
      expect(socketServiceSpy.modifyGame).toHaveBeenCalledWith(SocketEvent.REMOVE_ON_GOING_GAME, GAME_ID, type);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(GAME_LIST_URL);
    });

    it("#2.2 should open a ConfirmationDialogComponent, emit a leaveDuoGame message and return to the GameListView", () => {
      type = GameType.FREE;
      nPlayer = GameMode.DUO;

      matDialogSpy.open.and.returnValue(new MatDialogRefStub());
      popupService.openConfirmationLeaveGameDialog(action, GAME_ID, type, nPlayer);

      expect(matDialogSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {disableClose: true});
      expect(socketServiceSpy.emitDuoGameEvent).toHaveBeenCalledWith(SocketEvent.LEAVE_DUO_GAME, GAME_ID, type);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(GAME_LIST_URL);
    });

  });

  describe("#3 openEndGameDialog(message: string)", () => {
      it("#3.1 should call navigateByUrl on router to go back to games list when dialog is closed", () => {
        matDialogSpy.open.and.returnValue(new MatDialogRefStub());
        popupService.openEndGameDialog("test action");
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(GAME_LIST_URL);
      });
  });

  describe("#4 openModifyGameConfirmationDialog(event: SocketEvent, action: string, gameId: string, type: GameType)", () => {
    let event: SocketEvent;
    action = "supprimer";

    it("#4.1 should open a ConfirmationDialogComponent, emit a removeGame message and return to the GameListView", () => {
      event = SocketEvent.REMOVE_GAME;
      type = GameType.FREE;

      matDialogSpy.open.and.returnValue(new MatDialogRefStub());
      popupService.openModifyGameConfirmationDialog(event, action, GAME_ID, type);

      expect(matDialogSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {disableClose: false});
      expect(socketServiceSpy.modifyGame).toHaveBeenCalledWith(event, GAME_ID, type);
    });
  });

  describe("#5 openSnackBar(message: string)", () => {
    let message: string;
    let expectedConfig: MatSnackBarConfig;

    it("#5.1 should open a ConfirmationDialogComponent, emit a removeGame message and return to the GameListView", () => {
      message = "testMessage";
      expectedConfig = {
        verticalPosition: "top",
        panelClass: ["error-snack-bar"],
        duration: 4000,
      };

      popupService.openSnackBar(message);

      expect(matSnackBarSpy.open).toHaveBeenCalledWith(message, "OK", expectedConfig);
    });
  });
});
