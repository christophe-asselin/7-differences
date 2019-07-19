import { Component, ViewChild} from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material";
import { INewSimpleGameInfos } from "../../../../common/INewSimpleGameInfos";
import { Game3D } from "../game3-d/Game3D";
import { GamesListViewComponent } from "../games-list-view/games-list-view.component";
import { NewFPVGameDialogComponent } from "../new-fpvgame-dialog/new-fpvgame-dialog.component";
import { NewSPVGameDialogComponent } from "../new-spvgame-dialog/new-spvgame-dialog.component";

@Component({
  selector: "app-admin-view",
  templateUrl: "./admin-view.component.html",
  styleUrls: ["./admin-view.component.css"],
})
export class AdminViewComponent {

  @ViewChild(GamesListViewComponent) private gamesList: GamesListViewComponent;

  public constructor(private dialog: MatDialog) { }

  public openSPVgameDialog(): void {
    const dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef: MatDialogRef<NewSPVGameDialogComponent> = this.dialog.open(NewSPVGameDialogComponent, dialogConfig);
    dialogRef.componentInstance.gameCreated.subscribe((newGameInfo: INewSimpleGameInfos) => {
      this.gamesList.createSimpleGame(newGameInfo);
    });
  }

  public openFPVgameDialog(): void {
    const dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef: MatDialogRef<NewFPVGameDialogComponent> = this.dialog.open(NewFPVGameDialogComponent, dialogConfig);
    dialogRef.componentInstance.gameCreated.subscribe((newGameInfo: Game3D) => {
      this.gamesList.createFreeGame(newGameInfo);
    });
  }

}
