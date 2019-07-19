import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { GameMessagesComponent } from "../game-messages/game-messages.component";
import { SimpleGameViewComponent } from "./simple-game-view.component";

import { HttpClientModule } from "@angular/common/http";
import { MatDialog } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router, RouterModule, Routes } from "@angular/router";
import { of, Observable } from "rxjs";
import { GameState, GameType } from "../../../../common/GameEnum";
import { ICoordinate } from "../../../../common/ICoordinate";
import { IGameMessage } from "../../../../common/IGameMessage";
import { ISimpleGame } from "../../../../common/ISimpleGame";
import { IUser } from "../../../../common/IUser";
import { SocketEvent } from "../../../../common/SocketEvent";
import { IDifferenceIdentificationMessage } from "../../../../common/communication/IDifferenceIdentificationMessage";
import { Title } from "../../../../common/communication/TitleEnum";
import { EndGameDialogComponent } from "../end-game-dialog/end-game-dialog.component";
import { MaterialImportsModule } from "../material-imports/material-imports.module";
import { GameService } from "../services/game.service";
import { SimpleDifferenceService } from "../services/simple-difference.service";
import { SocketService } from "../services/socket.service";
import { WaitingViewComponent } from "../waiting-view/waiting-view.component";

const routes: Routes = [
  { path: "games/simple/:id", component: SimpleGameViewComponent },
];

class GameServiceStub {
  public getGame(id: string, type: GameType): Observable<ISimpleGame> {
    return of({
      _id: id,
      name: "mock",
      type: GameType.SIMPLE,
      originalImageURL: "data:image/bmp;base64,AAAA",
      modifiedImageURL: "data:image/bmp;base64,BBBB",
      differenceRegions: [],
      dataDifference: {labels: [], regions: []},
      scoreSolo: [],
      scoreDuo: [],
      state: GameState.NOT_WAITING,
    });
  }
}

class SocketServiceStub {
  public getUser(): IUser {
    return { username: "", userId: "0" };
  }

  public sendPrivateMessage(message: IGameMessage): void {
    return;
  }

  public resetModifiedImageUrl(gameId: number, type: GameType, backupUrl: string): void {
    return;
  }
  // return observable of generic type
  // tslint:disable-next-line:no-any
  public onEvent(event: SocketEvent): Observable<any> {
    return of({});
  }

  public addGame(): void {
    return;
  }

  public modifyGame(): void {
    return;
  }

  public checkIfNewBestScore(): void {
    return;
  }
}

describe("SimpleGameViewComponent", async () => {
  let component: SimpleGameViewComponent;
  let fixture: ComponentFixture<SimpleGameViewComponent>;

  const gameServiceStub: GameServiceStub = new GameServiceStub();
  const socketServiceStub: SocketServiceStub = new SocketServiceStub();

  let simpleDifferenceServiceSpy: jasmine.SpyObj<SimpleDifferenceService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let routerSpy: jasmine.SpyObj<Router>;

  // spy sur reference a une boite de dialog
  // tslint:disable-next-line: no-any
  const spyDialogRef: any = jasmine.createSpy();
  spyDialogRef.componentInstance = {title: "", message: ""};
  spyDialogRef.afterClosed = () => of(true);

  matDialogSpy = jasmine.createSpyObj("MatDialog", ["open"]);
  matDialogSpy.open.and.returnValue(spyDialogRef);

  beforeEach(async(() => {
    simpleDifferenceServiceSpy = jasmine.createSpyObj("SimpleDifferenceService", ["checkIfDifference", "replacePixels"]);
    routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

    TestBed.configureTestingModule({
      declarations: [ SimpleGameViewComponent, GameMessagesComponent, WaitingViewComponent, EndGameDialogComponent ],
      imports: [HttpClientModule,
                BrowserModule,
                MaterialImportsModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(routes)],
      providers: [{ provide: ActivatedRoute, useValue: { params: of({ id: 0, nPlayers: "solo" }) } },
                  { provide: GameService, useValue: gameServiceStub },
                  { provide: SimpleDifferenceService, useValue: simpleDifferenceServiceSpy },
                  { provide: SocketService, useValue: socketServiceStub },
                  { provide: MatDialog, useValue: matDialogSpy },
                  { provide: Router, useValue: routerSpy }],
    })
    .compileComponents().then().catch();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleGameViewComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#1 onImageClick(offsetX: number, offsetY: number, clientX: number, clientY: number)", () => {

    beforeEach(() => {
      const GAME_ID: string = "test";
      gameServiceStub.getGame(GAME_ID, GameType.SIMPLE).subscribe((game: ISimpleGame) => {
        component.currentGame = game;
      });
      const MOCK_COORDINATE: ICoordinate = { x: 64, y: 424 };
      const MOCK_SUCCESS_MESSAGE: IDifferenceIdentificationMessage = {
        title: Title.SUCCESS,
        differenceIdentified: true,
        newModifiedImageURL: "data:image/bmp;base64,CCCC",
        coordinates: [MOCK_COORDINATE],
      };
      simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of(MOCK_SUCCESS_MESSAGE));
    });

    it("#1.1 Should call SimpleDifferenceService if coordinates are not part of a previously identified difference", () => {
      const X: number = 64;
      const Y: number = 56;
      component.onImageClick(X, Y, X, Y);
      expect(simpleDifferenceServiceSpy.checkIfDifference).toHaveBeenCalled();
    });

    it("#1.2 Should not call SimpleDifferenceService if coordinates are part of a previously identified difference", () => {
      const X: number = 64;
      const Y: number = 56;
      component.onImageClick(X, Y, X, Y);
      component.onImageClick(X, Y, X, Y);
      expect(simpleDifferenceServiceSpy.checkIfDifference.calls.count()).toBe(1);
    });

    it("#1.3 Should call PixelReplacementService if coordinates are part of a difference", () => {
      const X: number = 64;
      const Y: number = 56;
      component.onImageClick(X, Y, X, Y);
      expect(simpleDifferenceServiceSpy.checkIfDifference).toHaveBeenCalled();
    });

    it("#1.4 Should not call PixelReplacementService if coordinates are not part of a difference", () => {
      const X: number = 64;
      const Y: number = 56;
      component.onImageClick(X, Y, X, Y);

      const MOCK_FAILURE_MESSAGE: IDifferenceIdentificationMessage = {
        title: Title.FAIL,
        differenceIdentified: false,
      };
      simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of(MOCK_FAILURE_MESSAGE));

      component.onImageClick(X, Y, X, Y);
      expect(simpleDifferenceServiceSpy.checkIfDifference.calls.count()).toBe(1);
    });

    it("#1.5 Should not change modifiedImageUrl if error occurs while replacing pixels", () => {
      simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of({ title: Title.FAIL, differenceIdentified: false}));
      const X: number = 64;
      const Y: number = 56;
      component.onImageClick(X, Y, X, Y);
      expect(component.currentGame.modifiedImageURL).toBe("data:image/bmp;base64,BBBB");
    });
  });

  describe("#2 onIdentificationError(offsetX: number, offsetY: number)", () => {

    it("#2.1 Should call onIdentificationError method when coordinates are not part of a difference", () => {
      const X: number = 64;
      const Y: number = 56;
      const MOCK_FAILURE_MESSAGE: IDifferenceIdentificationMessage = {
        title: Title.SUCCESS,
        differenceIdentified: false,
      };
      simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of(MOCK_FAILURE_MESSAGE));
      spyOn(component, "onIdentificationError");
      component.onImageClick(X, Y, X, Y);
      expect(component.onIdentificationError).toHaveBeenCalled();
    });

    it("#2.2 Should be in identificationError mode if coordinates are not part of a difference", () => {
      const X: number = 64;
      const Y: number = 56;

      const MOCK_FAILURE_MESSAGE: IDifferenceIdentificationMessage = {
        title: Title.SUCCESS,
        differenceIdentified: false,
      };
      simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of(MOCK_FAILURE_MESSAGE));
      component.onImageClick(X, Y, X, Y);
      expect(component.isError).toBe(true);
    });

    it("#2.3 Should be in identificationError mode for 1000 ms", () => {
      const X: number = 64;
      const Y: number = 56;
      const TIME: number = 1000;
      jasmine.clock().install();
      component.onIdentificationError(X, Y);
      expect(component.isError).toBe(true);
      jasmine.clock().tick(TIME);
      expect(component.isError).toBe(false);
      jasmine.clock().uninstall();

    });
  });

  describe("#3 timer", () => {

    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it("#3.1 should get incremented by 1000ms after one second", () => {
      const beginTime: number = component.elapsedTime;
      component.startTimer();
      const SECOND: number = 1000;
      jasmine.clock().tick(SECOND);
      expect(component.elapsedTime).toBe(beginTime + SECOND);
    });

    it("#3.2 should not get incremented after stopTimer() has been called ", () => {
      const beginTime: number = component.elapsedTime;
      component.startTimer();
      component.stopTimer();
      const SECOND: number = 1000;
      jasmine.clock().tick(SECOND);
      expect(component.elapsedTime).toBe(beginTime);
    });

  });

  describe("#4 onDifferenceFound(coordinates: ICoordinates[])", () => {

    beforeEach(() => {
      const GAME_ID: string = "test";
      gameServiceStub.getGame(GAME_ID, GameType.SIMPLE).subscribe((game: ISimpleGame) => {
        component.currentGame = game;
      });
    });

    it("#4.1 nDifferencesFoundSolo should be incremented if difference is found", () => {
      const MOCK_COORDINATE: ICoordinate = { x: 64, y: 424 };
      const MOCK_SUCCESS_MESSAGE: IDifferenceIdentificationMessage = {
        title: Title.SUCCESS,
        differenceIdentified: true,
        newModifiedImageURL: "data:image/bmp;base64,CCCC",
        coordinates: [MOCK_COORDINATE],
      };
      simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of(MOCK_SUCCESS_MESSAGE));

      const originalNDifferencesFound: number = component.nDifferencesFoundSolo;
      const X: number = 64;
      const Y: number = 56;
      component.onImageClick(X, Y, X, Y);
      expect(component.nDifferencesFoundSolo).toBe(originalNDifferencesFound + 1);
    });

    it("#4.2 nDifferencesFoundSolo should not be incremented if difference is not found", () => {
      const MOCK_FAILURE_MESSAGE: IDifferenceIdentificationMessage = {
        title: Title.FAIL,
        differenceIdentified: false,
      };
      simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of(MOCK_FAILURE_MESSAGE));

      const originalNDifferencesFound: number = component.nDifferencesFoundSolo;
      const X: number = 64;
      const Y: number = 56;
      component.onImageClick(X, Y, X, Y);
      expect(component.nDifferencesFoundSolo).toBe(originalNDifferencesFound);
    });

    it("#4.3 nDifferencesFoundSolo should not be incremented if pixel is part of an already identified difference", () => {
      const MOCK_COORDINATE: ICoordinate = { x: 64, y: 424 };
      const MOCK_SUCCESS_MESSAGE: IDifferenceIdentificationMessage = {
        title: Title.SUCCESS,
        differenceIdentified: true,
        newModifiedImageURL: "data:image/bmp;base64,CCCC",
        coordinates: [MOCK_COORDINATE],
      };
      simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of(MOCK_SUCCESS_MESSAGE));
      const originalNDifferencesFound: number = component.nDifferencesFoundSolo;
      const X: number = 64;
      const Y: number = 56;
      component.onImageClick(X, Y, X, Y);
      component.onImageClick(X, Y, X, Y);
      expect(component.nDifferencesFoundSolo).toBe(originalNDifferencesFound + 1);
    });
  });

  describe("#5 checkIfNewBestScore()", () => {

    it("#5.1 checkIfNewBestScore should be called on socket when all differences are found", (done) => {
      spyOn(socketServiceStub, "checkIfNewBestScore");

      let x: number = 64;
      let y: number = 56;
      const N_MAX_DIFFERENCES: number = 7;
      for (let i: number = 0; i < N_MAX_DIFFERENCES; i++) {
        x++;
        y++;
        const MOCK_SUCCESS_MESSAGE: IDifferenceIdentificationMessage = {
          title: Title.SUCCESS,
          differenceIdentified: true,
          newModifiedImageURL: "data:image/bmp;base64,CCCC",
          coordinates: [ { x: x, y: y }],
        };
        simpleDifferenceServiceSpy.checkIfDifference.and.returnValue(of(MOCK_SUCCESS_MESSAGE));
        component.onImageClick(x, y, x, y);
      }
      fixture.detectChanges();
      expect(component.nDifferencesFoundSolo).toBe(N_MAX_DIFFERENCES);
      expect(socketServiceStub.checkIfNewBestScore).toHaveBeenCalled();
      done();
    });
  });
  // tslint:disable:max-file-line-count
});
