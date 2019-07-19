import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { GamesListViewComponent } from "./games-list-view.component";

import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router, RouterModule, Routes } from "@angular/router";

import { MatDialog, MatDialogRef } from "@angular/material";
import { of, Observable } from "rxjs";
import { Game3DType } from "../../../../common/Game3DType";
import { GameMode, GameState, GameType } from "../../../../common/GameEnum";
import { IFreeGame } from "../../../../common/IFreeGame";
import { ISimpleGame } from "../../../../common/ISimpleGame";
import { SocketEvent } from "../../../../common/SocketEvent";
import { Title } from "../../../../common/communication/TitleEnum";
import { Message } from "../../../../common/communication/message";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { FreeGameViewComponent } from "../free-game-view/free-game-view.component";
import { GameMessagesComponent } from "../game-messages/game-messages.component";
import { MaterialImportsModule } from "../material-imports/material-imports.module";
import { GameService } from "../services/game.service";
import { SocketService } from "../services/socket.service";
import { SimpleGameViewComponent } from "../simple-game-view/simple-game-view.component";

const routes: Routes = [
  { path: "games", component: GamesListViewComponent },
  { path: "games/simple/:id", component: SimpleGameViewComponent },
  { path: "games/free/:id", component: FreeGameViewComponent },
];
const freeGameStub: IFreeGame[] = [
  {
    _id: "0",
    name: "free",
    game3Dtype: Game3DType.GEOMETRIC,
    type: GameType.FREE,
    originalImageURL: "",
    scoreSolo: [],
    scoreDuo: [],
    originalObjects: [],
    modifiedObjects: [],
    state: GameState.NOT_WAITING,
  },
];
const simpleGameStub: ISimpleGame[] = [
  {
    _id: "1",
    name: "simple",
    type: GameType.SIMPLE,
    differenceRegions: [],
    originalImageURL: "",
    modifiedImageURL: "",
    scoreSolo: [],
    scoreDuo: [],
    state: GameState.NOT_WAITING,
  },
];

const messageSimple: Message = {title: Title.NOT_WAITING, body: "1"};
const messageFree: Message = {title: Title.NOT_WAITING, body: "0"};

class GameServiceStub {
  public getGames(type: GameType): Observable<ISimpleGame[] | IFreeGame[]> {
    return (type === GameType.SIMPLE) ? of(simpleGameStub) : of(freeGameStub);
  }
}

describe("GamesListViewComponent", () => {
  let component: GamesListViewComponent;
  let fixture: ComponentFixture<GamesListViewComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let socketServiceSpy: jasmine.SpyObj<SocketService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;

  const gameServiceStub: GameServiceStub = new GameServiceStub();

  beforeEach(async(() => {
    routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
    socketServiceSpy = jasmine.createSpyObj("SocketService", ["getUser",
                                                              "onEvent",
                                                              "emitDuoGameEvent",
                                                              "emitAdminEvent",
                                                              "addSimpleGame",
                                                              "addFreeGame",
                                                              "modifyGame"]);
    matDialogSpy = jasmine.createSpyObj("MatDialog", ["open", "afterClosed"]);
    dialogRefSpy = jasmine.createSpyObj("MatDialogRef<ConfirmationDialogComponent>", ["afterClosed", "componentInstance"]);

    TestBed.configureTestingModule({
      declarations: [ GamesListViewComponent, SimpleGameViewComponent, FreeGameViewComponent, GameMessagesComponent ],
      imports: [MaterialImportsModule,
                HttpClientModule,
                BrowserModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(routes)],
      providers: [{ provide: Router, useValue: routerSpy },
                  { provide: SocketService, useValue: socketServiceSpy },
                  { provide: GameService, useValue: gameServiceStub },
                  { provide: MatDialog, useValue: matDialogSpy }],
    }).compileComponents().then().catch();
  }));

  beforeEach(() => {
    socketServiceSpy.getUser.and.returnValue({ name: "testname", id: "1" });
    socketServiceSpy.onEvent.and.callFake((event: SocketEvent) => {
      switch (event) {
        case SocketEvent.UPDATE_SIMPLE_GAMES: return of(simpleGameStub);
        case SocketEvent.UPDATE_FREE_GAMES: return of(freeGameStub);
        case SocketEvent.UPDATE_SIMPLE_GAME_STATE: return of(messageSimple);
        case SocketEvent.UPDATE_FREE_GAME_STATE: return of(messageFree);
        default: return undefined;
      }
    });

    fixture = TestBed.createComponent(GamesListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.ngOnInit();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#1 initGames()", () => {
    it("#1.1 initGames should initialize simpleGames with the rights game information", () => {
      expect(component.simpleGames).toEqual(simpleGameStub);
    });

    it("#2.2 initGames should initialize freeGames with the rights game information", () => {
      expect(component.freeGames).toEqual(freeGameStub);
    });
  });

  describe("#2 onPlayClick(gameId: number, type: GameType)", () => {
    it("#2.1 when onPlayClick is called, navigateByUrl sould be called with the correct url", () => {
      routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
      component.onPlayClick("1", GameType.SIMPLE);
      const EXPECTED_URL: string = "/games/" + GameType.SIMPLE + "/" + GameMode.SOLO + "/" + 1;
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(EXPECTED_URL);
    });
  });

  describe("#3 onCreateClick(gameId: number, type: GameType)", () => {
    it("#3.1 when onCreateClick is called, navigateByUrl sould be called with the correct url", () => {
      routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
      component.onCreateClick("1", GameType.SIMPLE);
      const EXPECTED_URL: string = "/games/waiting/" + GameType.SIMPLE + "/" + 1;
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(EXPECTED_URL);
    });
  });

  describe("#4 onJoinClick(gameId: number, type: GameType)", () => {
    it("#4.1 sould call navigateByUrl with the correct url", () => {
      routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
      component.onJoinClick("1", GameType.SIMPLE);
      const EXPECTED_URL: string = "/games/" + GameType.SIMPLE + "/" + GameMode.DUO + "/" + 1;
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(EXPECTED_URL);
    });

    it("#4.2 should call joinDuoGame with the correct parameters", () => {
      routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
      component.onJoinClick("1", GameType.SIMPLE);
      expect(socketServiceSpy.emitDuoGameEvent).toHaveBeenCalledWith(SocketEvent.JOIN_DUO_GAME, "1", GameType.SIMPLE);
    });
  });

  describe("#5 onRemoveClick(gameId: number, type: GameType)", () => {
    it("#5.1 should call removeGame with the correct parameters when confirmed by user", () => {
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      matDialogSpy.open.and.returnValue(dialogRefSpy);
      component.onRemoveClick("1", GameType.SIMPLE);
      expect(socketServiceSpy.modifyGame).toHaveBeenCalledWith(SocketEvent.REMOVE_GAME, "1", GameType.SIMPLE);
    });

    it("#5.2 should not call removeGame when cancelled by user", () => {
      dialogRefSpy.afterClosed.and.returnValue(of(false));
      matDialogSpy.open.and.returnValue(dialogRefSpy);
      component.onRemoveClick("1", GameType.SIMPLE);
      expect(socketServiceSpy.modifyGame).not.toHaveBeenCalled();
    });
  });

  describe("#6 onResetClick(gameId: number, type: GameType)", () => {
    it("#6.1 should call resetScores with the correct parametrs when confirmed by user", () => {
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      matDialogSpy.open.and.returnValue(dialogRefSpy);
      component.onResetClick("1", GameType.SIMPLE);
      expect(socketServiceSpy.modifyGame).toHaveBeenCalledWith(SocketEvent.RESET_SCORES, "1", GameType.SIMPLE);
    });

    it("#6.2 should not call resetScores when cancelled by user", () => {
      dialogRefSpy.afterClosed.and.returnValue(of(false));
      matDialogSpy.open.and.returnValue(dialogRefSpy);
      component.onResetClick("1", GameType.SIMPLE);
      expect(socketServiceSpy.modifyGame).not.toHaveBeenCalled();
    });
  });

});
