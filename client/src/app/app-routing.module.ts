import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AdminViewComponent } from "./admin-view/admin-view.component";
import { ConnectViewComponent } from "./connect-view/connect-view.component";
import { FreeGameViewComponent } from "./free-game-view/free-game-view.component";
import { GamesListViewComponent } from "./games-list-view/games-list-view.component";
import { SimpleGameViewComponent } from "./simple-game-view/simple-game-view.component";
import { WaitingViewComponent } from "./waiting-view/waiting-view.component";

export const routes: Routes = [
  { path: "",   redirectTo: "/connect", pathMatch: "full" },
  { path: "connect", component: ConnectViewComponent },
  { path: "admin", component: AdminViewComponent },
  { path: "games", component: GamesListViewComponent },
  { path: "games/simple/:nPlayers/:id", component: SimpleGameViewComponent },
  { path: "games/free/:nPlayers/:id", component: FreeGameViewComponent },
  { path: "games/waiting/:type/:id", component: WaitingViewComponent },
];

@NgModule({
  declarations: [],
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
})
export class AppRoutingModule { }
