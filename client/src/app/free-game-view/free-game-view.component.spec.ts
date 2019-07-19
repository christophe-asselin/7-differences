import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { GameMessagesComponent } from "../game-messages/game-messages.component";
import { FreeGameViewComponent } from "./free-game-view.component";

import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router, RouterModule, Routes } from "@angular/router";
import { of } from "rxjs";
import { MaterialImportsModule } from "../material-imports/material-imports.module";

import { MatDialog } from "@angular/material";
import { GameEvent, GameMode, GameState, GameType } from "../../../../common/GameEnum";
import { IGameMessage } from "../../../../common/IGameMessage";
import { EndGameDialogComponent } from "../end-game-dialog/end-game-dialog.component";
import { RenderService } from "../game3-d/render.service";
import { FreeDifferenceService } from "../services/free-difference.service";
import { GameService } from "../services/game.service";
import { SocketService } from "../services/socket.service";

const routes: Routes = [
  { path: "games/free/:id", component: FreeGameViewComponent },
];

describe("FreeGameViewComponent", () => {
  let component: FreeGameViewComponent;
  let fixture: ComponentFixture<FreeGameViewComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let renderSpy: jasmine.SpyObj<RenderService>;
  let freeDifferenceServiceSpy: jasmine.SpyObj<FreeDifferenceService>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let socketServiceSpy: jasmine.SpyObj<SocketService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  // spy sur reference a une boite de dialog
  // tslint:disable-next-line: no-any
  const spyDialogRef: any = jasmine.createSpy();
  spyDialogRef.componentInstance = {title: "", message: ""};
  spyDialogRef.afterClosed = () => of(true);

  matDialogSpy = jasmine.createSpyObj("MatDialog", ["open"]);
  matDialogSpy.open.and.returnValue(spyDialogRef);

  beforeEach(async(() => {
    routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
    renderSpy = jasmine.createSpyObj("RenderService", ["initialize", "restoreDifference"]);
    freeDifferenceServiceSpy = jasmine.createSpyObj("FreeDifferenceService", [
                                                    "setOriginalSceneObjects",
                                                    "setCamera",
                                                    "compareObjectInScenes",
                                                    "findClickedObjectIndex",
                                                  ]);
    gameServiceSpy = jasmine.createSpyObj("GameService", ["getGame"]);
    socketServiceSpy = jasmine.createSpyObj("SocketService", ["getUser", "sendPrivateMessage",
                                                              "checkIfNewBestScore", "onEvent", "addGame", "modifyGame"]);

    TestBed.configureTestingModule({
      declarations: [ FreeGameViewComponent, GameMessagesComponent, EndGameDialogComponent ],
      imports: [HttpClientModule,
                BrowserModule,
                MaterialImportsModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(routes)],
      providers: [{ provide: ActivatedRoute, useValue: { params: of({ id: "0", nPlayers: GameMode.SOLO }) } },
                  { provide: Router, useValue: routerSpy },
                  { provide: RenderService, useValue: renderSpy },
                  { provide: FreeDifferenceService, useValue: freeDifferenceServiceSpy },
                  { provide: GameService, useValue: gameServiceSpy },
                  { provide: MatDialog, useValue: matDialogSpy },
                  { provide: SocketService, useValue: socketServiceSpy }],
    })
    .compileComponents().then().catch();
  }));

  beforeEach(() => {
    renderSpy.initialize.and.returnValue(Promise.resolve());
    const CONNECT_MESSAGE: IGameMessage = {
      username: "TestUsername",
      event: GameEvent.CONNECT,
    };
    socketServiceSpy.onEvent.and.returnValue(of(CONNECT_MESSAGE));
    socketServiceSpy.getUser.and.returnValue(of({ username: "user", id: "1" }));
    gameServiceSpy.getGame.and.returnValue(of({
      id: 0,
      name: "name",
      type: GameType.FREE,
      originalImageUrl: "",
      scoreSolo: [],
      scoreDuo: [],
      originalObjects: [],
      modifiedObjects: [],
      state: GameState.NOT_WAITING,
    }));
    fixture = TestBed.createComponent(FreeGameViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#1 timer", () => {

    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it("#1.1 timer should get incremented by 1000ms after one second", () => {
      const beginTime: number = component.elapsedTime;
      component.startTimer();
      const SECOND: number = 1000;
      jasmine.clock().tick(SECOND);
      expect(component.elapsedTime).toBe(beginTime + SECOND);
    });

    it("#1.2 timer should not get incremented after stopTimer() has been called ", () => {
      const beginTime: number = component.elapsedTime;
      component.startTimer();
      component.stopTimer();
      const SECOND: number = 1000;
      jasmine.clock().tick(SECOND);
      expect(component.elapsedTime).toBe(beginTime);
    });

  });

  describe("#2 onSceneClick(offsetX: number, offsetY: number)", () => {

    const X: number = 50;
    const Y: number = 60;

    it("#2.1 should call findClickedObjectIndex to get the object index", () => {
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(true));
      component.onSceneClick(X, Y, X, Y);
      expect(freeDifferenceServiceSpy.findClickedObjectIndex).toHaveBeenCalled();
    });

    it("#2.2 should call compareObjectInScenes if object has not already been identified and is not in error state", () => {
      freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(1);
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(true));
      component.onSceneClick(X, Y, X, Y);
      expect(freeDifferenceServiceSpy.compareObjectInScenes).toHaveBeenCalled();
    });

    it("#2.3 should not call compareObjectInScenes if object has already been identified", () => {
      freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(1);
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(true));
      component.onSceneClick(X, Y, X, Y);
      component.onSceneClick(X, Y, X, Y);
      expect(freeDifferenceServiceSpy.compareObjectInScenes).toHaveBeenCalledTimes(1);
    });

    it("#2.4 should call restoreDifference when a difference was successfully identified", () => {
      freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(1);
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(true));
      component.onSceneClick(X, Y, X, Y);
      expect(renderSpy.restoreDifference).toHaveBeenCalledTimes(1);
    });

    it("#2.5 should increment nDifferencesFoundSolo when difference is found and game mode is solo", () => {
      freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(1);
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(true));
      component.onSceneClick(X, Y, X, Y);
      expect(component.nDifferencesFoundSolo).toEqual(1);
    });

    it("#2.6 should not increment nDifferencesFoundSolo when difference is not found", () => {
      freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(1);
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(false));
      component.onSceneClick(X, Y, X, Y);
      expect(component.nDifferencesFoundSolo).toEqual(0);
    });

    it("2.7 should stop timer when 7 differences are found", (done) => {
      spyOn(component, "stopTimer");
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(true));
      const N_MAX_DIFFERENCES: number = 7;
      for (let i: number = 0; i < N_MAX_DIFFERENCES; i++) {
        freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(i);
        component.onSceneClick(X, Y, X, Y);
      }
      fixture.detectChanges();
      expect(component.stopTimer).toHaveBeenCalled();
      done();
    });
  });

  describe("#3 onIdentificationError(clientX: number, clientY: number)", () => {

    const X: number = 64;
    const Y: number = 56;

    it("#3.1 Should call onIdentificationError method when coordinates are not part of a difference", () => {
      freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(1);
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(false));
      spyOn(component, "onIdentificationError");
      component.onSceneClick(X, Y, X, Y);
      expect(component.onIdentificationError).toHaveBeenCalled();
    });

    it("#3.2 Should be in errorState mode if coordinates are not part of a difference", () => {
      freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(1);
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(false));
      component.onSceneClick(X, Y, X, Y);
      expect(component["isInErrorState"]).toBe(true);
    });

    it("#3.3 Should be in errorState mode for 1000 ms", () => {

      const TIME: number = 1000;
      jasmine.clock().install();
      component.onIdentificationError(X, Y);
      expect(component["isInErrorState"]).toBe(true);
      jasmine.clock().tick(TIME);
      expect(component["isInErrorState"]).toBe(false);
      jasmine.clock().uninstall();

    });
  });

  describe("#4 checkIfNewBestScore()", () => {

    const X: number = 50;
    const Y: number = 60;

    it("#4.1 checkIfNewBestScore should be called on socket when all differences are found", (done) => {
      freeDifferenceServiceSpy.compareObjectInScenes.and.returnValue(of(true));
      const N_MAX_DIFFERENCES: number = 7;
      for (let i: number = 0; i < N_MAX_DIFFERENCES; i++) {
        freeDifferenceServiceSpy.findClickedObjectIndex.and.returnValue(i);
        component.onSceneClick(X, Y, X, Y);
      }
      fixture.detectChanges();
      expect(component.nDifferencesFoundSolo).toBe(N_MAX_DIFFERENCES);
      expect(socketServiceSpy.checkIfNewBestScore).toHaveBeenCalled();
      done();
    });
  });
});
