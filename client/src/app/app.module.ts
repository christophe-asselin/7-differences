import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AdminViewComponent } from "./admin-view/admin-view.component";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { ConnectViewComponent } from "./connect-view/connect-view.component";
import { EndGameDialogComponent } from "./end-game-dialog/end-game-dialog.component";
import { FreeGameViewComponent } from "./free-game-view/free-game-view.component";
import { GameMessagesComponent } from "./game-messages/game-messages.component";
import { DifferenceThematicGeneratorService } from "./game3-d-theme/difference-thematic-generator.service";
import { Game3DThemeGeneratorService } from "./game3-d-theme/game3d-theme-generator.service";
import { RenderService } from "./game3-d/render.service";
import { GamesListViewComponent } from "./games-list-view/games-list-view.component";
import { MaterialImportsModule } from "./material-imports/material-imports.module";
import { NewFPVGameDialogComponent } from "./new-fpvgame-dialog/new-fpvgame-dialog.component";
import { NewSPVGameDialogComponent } from "./new-spvgame-dialog/new-spvgame-dialog.component";
import { SimpleGameViewComponent } from "./simple-game-view/simple-game-view.component";
import { WaitingViewComponent } from "./waiting-view/waiting-view.component";

@NgModule({
  declarations: [
    AppComponent,
    ConnectViewComponent,
    AdminViewComponent,
    NewSPVGameDialogComponent,
    GamesListViewComponent,
    SimpleGameViewComponent,
    FreeGameViewComponent,
    NewFPVGameDialogComponent,
    WaitingViewComponent,
    GameMessagesComponent,
    ConfirmationDialogComponent,
    EndGameDialogComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialImportsModule,
  ],
  providers: [RenderService, Game3DThemeGeneratorService, DifferenceThematicGeneratorService],
  bootstrap: [AppComponent],
  entryComponents: [
    NewSPVGameDialogComponent,
    NewFPVGameDialogComponent,
    ConfirmationDialogComponent,
    EndGameDialogComponent,
  ],
})
export class AppModule { }
