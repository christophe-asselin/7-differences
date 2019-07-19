import { HttpClientModule } from "@angular/common/http";
import { async, ComponentFixture, TestBed  } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { AdminViewComponent } from "./admin-view/admin-view.component";
import { routes } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ConnectViewComponent } from "./connect-view/connect-view.component";
import { FreeGameViewComponent } from "./free-game-view/free-game-view.component";
import { GameMessagesComponent } from "./game-messages/game-messages.component";
import { GamesListViewComponent } from "./games-list-view/games-list-view.component";
import { MaterialImportsModule } from "./material-imports/material-imports.module";
import { NewSPVGameDialogComponent } from "./new-spvgame-dialog/new-spvgame-dialog.component";
import { SimpleGameViewComponent } from "./simple-game-view/simple-game-view.component";
import { WaitingViewComponent } from "./waiting-view/waiting-view.component";

describe("AppComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        AdminViewComponent,
        NewSPVGameDialogComponent,
        GamesListViewComponent,
        ConnectViewComponent,
        SimpleGameViewComponent,
        FreeGameViewComponent,
        GameMessagesComponent,
        WaitingViewComponent,
      ],
      imports: [HttpClientModule,
                MaterialImportsModule,
                RouterTestingModule,
                FormsModule,
                BrowserModule,
                HttpClientModule,
                ReactiveFormsModule,
                RouterModule.forRoot(routes)],
      providers: [],
    }).compileComponents().then().catch();
  }));

  it("should create the app", async(() => {
    const fixture: ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
    const app: AppComponent = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

});
