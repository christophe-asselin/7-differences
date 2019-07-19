import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: "app-end-game-dialog",
  templateUrl: "./end-game-dialog.component.html",
  styleUrls: ["./end-game-dialog.component.css"],
})
export class EndGameDialogComponent {

  public message: string;

  public constructor(public dialogRef: MatDialogRef<EndGameDialogComponent>) {
    this.message = "";
  }

}
