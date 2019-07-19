import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: "app-confirmation-dialog",
  templateUrl: "./confirmation-dialog.component.html",
  styleUrls: ["./confirmation-dialog.component.css"],
})
export class ConfirmationDialogComponent {

  public action: string;

  public constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
    this.action = "";
  }

}
