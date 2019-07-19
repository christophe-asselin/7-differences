import { HttpClientModule } from "@angular/common/http";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router, RouterModule, Routes } from "@angular/router";
import { of } from "rxjs";

import { GameMode, GameState, GameType } from "../../../../common/GameEnum";
import { MaterialImportsModule } from "../material-imports/material-imports.module";
import { GameService } from "../services/game.service";
import { SocketService } from "../services/socket.service";
import { WaitingViewComponent } from "./waiting-view.component";

const routes: Routes = [
  { path: "games/waiting", component: WaitingViewComponent },
];

describe("WaitingViewComponent", () => {
  let component: WaitingViewComponent;
  let fixture: ComponentFixture<WaitingViewComponent>;

  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let socketServiceSpy: jasmine.SpyObj<SocketService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    gameServiceSpy = jasmine.createSpyObj("GameService", ["getGame"]);
    socketServiceSpy = jasmine.createSpyObj("SocketService", ["onEvent", "addGame", "modifyGame", "emitDuoGameEvent"]);
    routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

    TestBed.configureTestingModule({
      declarations: [ WaitingViewComponent ],
      imports: [HttpClientModule,
                BrowserModule,
                MaterialImportsModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(routes)],
      providers: [{ provide: ActivatedRoute, useValue: { params: of({ id: "1", nPlayers: "solo", type: "simple" }) }},
                  { provide: GameService, useValue: gameServiceSpy },
                  { provide: SocketService, useValue: socketServiceSpy },
                  { provide: Router, useValue: routerSpy }],
    })
    .compileComponents().then().catch();
  }));

  beforeEach(() => {
    gameServiceSpy.getGame.and.returnValue(of({
      _id: "1",
      name: "mock",
      type: GameType.SIMPLE,
      originalImageURL: "data:image/bmp;base64,AAAA",
      modifiedImageURL: "data:image/bmp;base64,BBBB",
      scoreSolo: [],
      scoreDuo: [],
      state: GameState.NOT_WAITING,
    }));
    socketServiceSpy.onEvent.and.returnValue(of({}));
    routerSpy.navigateByUrl.and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(WaitingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#1 ngOnInit()", () => {
    it("#1.1 should call navigateByUrl with the correct url when socket receives a NEW_DUO_PLAYER event", () => {
      const EXPECTED_URL: string = "/games/" + GameType.SIMPLE + "/" + GameMode.DUO + "/1";
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(EXPECTED_URL);
    });

    it("#1.2 should call navigateByUrl with the correct url when socket receives a REMOVE_GAME event", () => {
      const EXPECTED_URL: string = "/games";
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(EXPECTED_URL);
    });
  });

  describe("#2 getGame()", () => {
    it("#2.1 should call GameService.getGame with the correct id and game type", () => {
      expect(gameServiceSpy.getGame).toHaveBeenCalledWith("1", GameType.SIMPLE, GameMode.SOLO);
    });
  });

  describe("#2 cancelNewGame()", () => {
    it("#3.1 should go back to games-list view when waiting for new game is cancelled", () => {
      const EXPECTED_URL: string = "/games";
      component.cancelNewGame();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(EXPECTED_URL);
    });
  });
});
