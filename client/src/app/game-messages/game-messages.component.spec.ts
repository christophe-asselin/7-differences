import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { GameMessagesComponent } from "./game-messages.component";

import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { of } from "rxjs";
import { GameEvent, GameMode, RankingString } from "../../../../common/GameEnum";
import { IGameMessage } from "../../../../common/IGameMessage";
import { MaterialImportsModule } from "../material-imports/material-imports.module";
import { SocketService } from "../services/socket.service";

const routes: Routes = [
  { path: "games/message", component: GameMessagesComponent },
];

describe("GameMessagesComponent", () => {
  let component: GameMessagesComponent;
  let fixture: ComponentFixture<GameMessagesComponent>;

  let socketServiceSpy: jasmine.SpyObj<SocketService>;

  const MOCK_DATE: Date = new Date();
  MOCK_DATE.setHours(1);
  MOCK_DATE.setMinutes(1);
  MOCK_DATE.setSeconds(1);

  beforeEach(async(() => {
    socketServiceSpy = jasmine.createSpyObj("SocketService", ["onEvent"]);
    TestBed.configureTestingModule({
      declarations: [ GameMessagesComponent ],
      imports: [HttpClientModule,
                BrowserModule,
                MaterialImportsModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(routes)],
      providers: [{ provide: SocketService, useValue: socketServiceSpy }],
    })
    .compileComponents().then().catch();
  }));

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(MOCK_DATE);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it("should create", () => {
    const CONNECT_MESSAGE: IGameMessage = {
      username: "TestUsername",
      event: GameEvent.CONNECT,
    };
    socketServiceSpy.onEvent.and.returnValue(of(CONNECT_MESSAGE));

    fixture = TestBed.createComponent(GameMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe("#1 generateMessage(message: IGameMessage)", () => {

    it("#1.1 If event is connect, should generate the correct message", () => {
      const CONNECT_MESSAGE: IGameMessage = {
        username: "TestUsername",
        event: GameEvent.CONNECT,
      };
      socketServiceSpy.onEvent.and.returnValue(of(CONNECT_MESSAGE));

      fixture = TestBed.createComponent(GameMessagesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const EXPECTED_MESSGE: string = "01:01:01 - TestUsername vient de se connecter.";
      expect(component.messages[0]).toBe(EXPECTED_MESSGE);
    });

    it("#1.2 If event is disconnect, should generate the correct message", () => {
      const DISCONNECT_MESSAGE: IGameMessage = {
        username: "TestUsername",
        event: GameEvent.DISCONNECT,
      };
      socketServiceSpy.onEvent.and.returnValue(of(DISCONNECT_MESSAGE));

      fixture = TestBed.createComponent(GameMessagesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const EXPECTED_MESSGE: string = "01:01:01 - TestUsername vient de se déconnecter.";
      expect(component.messages[0]).toBe(EXPECTED_MESSGE);
    });

    it("#1.2 If event is difference_found and game is solo, should generate the correct message", () => {
      const DIFFERENCE_FOUND_MESSAGE: IGameMessage = {
        username: "TestUsername",
        event: GameEvent.DIFFERENCE_FOUND,
        nPlayers: GameMode.SOLO,
      };
      socketServiceSpy.onEvent.and.returnValue(of(DIFFERENCE_FOUND_MESSAGE));

      fixture = TestBed.createComponent(GameMessagesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const EXPECTED_MESSGE: string = "01:01:01 - Différence trouvée.";
      expect(component.messages[0]).toBe(EXPECTED_MESSGE);
    });

    it("#1.3 If event is difference_found and game is 1 v 1, should generate the correct message", () => {
      const DIFFERENCE_FOUND_MESSAGE: IGameMessage = {
        username: "TestUsername",
        event: GameEvent.DIFFERENCE_FOUND,
        nPlayers: GameMode.DUO,
      };
      socketServiceSpy.onEvent.and.returnValue(of(DIFFERENCE_FOUND_MESSAGE));

      fixture = TestBed.createComponent(GameMessagesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const EXPECTED_MESSGE: string = "01:01:01 - Différence trouvée par TestUsername.";
      expect(component.messages[0]).toBe(EXPECTED_MESSGE);
    });

    it("#1.4 If event is error and game is solo, should generate the correct message", () => {
      const ERROR_MESSAGE: IGameMessage = {
        username: "TestUsername",
        event: GameEvent.ERROR_IDENTIFICATION,
        nPlayers: GameMode.SOLO,
      };
      socketServiceSpy.onEvent.and.returnValue(of(ERROR_MESSAGE));

      fixture = TestBed.createComponent(GameMessagesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const EXPECTED_MESSGE: string = "01:01:01 - Erreur.";
      expect(component.messages[0]).toBe(EXPECTED_MESSGE);
    });

    it("#1.5 If event is error and game is 1 v 1, should generate the correct message", () => {
      const ERROR_MESSAGE: IGameMessage = {
        username: "TestUsername",
        event: GameEvent.ERROR_IDENTIFICATION,
        nPlayers: GameMode.DUO,
      };
      socketServiceSpy.onEvent.and.returnValue(of(ERROR_MESSAGE));

      fixture = TestBed.createComponent(GameMessagesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const EXPECTED_MESSGE: string = "01:01:01 - Erreur par TestUsername.";
      expect(component.messages[0]).toBe(EXPECTED_MESSGE);
    });

    it("#1.6 If event is best_score, should generate the correct message", () => {
      const BEST_SCORE_MESSAGE: IGameMessage = {
        username: "TestUsername",
        event: GameEvent.BEST_SCORE,
        gameName: "TestGame",
        nPlayers: GameMode.SOLO,
        position: RankingString.FIRST,
      };
      socketServiceSpy.onEvent.and.returnValue(of(BEST_SCORE_MESSAGE));

      fixture = TestBed.createComponent(GameMessagesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const EXPECTED_MESSGE: string = "01:01:01 - TestUsername obtient la première place dans les meilleurs temps du jeu TestGame solo.";
      expect(component.messages[0]).toBe(EXPECTED_MESSGE);
    });

  });
});
