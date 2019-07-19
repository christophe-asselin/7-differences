import { Component, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { Game3DType } from "../../../../common/Game3DType";
import { Game3DThemeGeneratorService } from "../game3-d-theme/game3d-theme-generator.service";
import { ModifType } from "../game3-d/Enum";
import { Game3D } from "../game3-d/Game3D";
import { Game3DGenerationService } from "../game3-d/game3-dgeneration.service";

@Component({
  selector: "app-new-fpvgame-dialog",
  templateUrl: "./new-fpvgame-dialog.component.html",
  styleUrls: ["./new-fpvgame-dialog.component.css"],
})
export class NewFPVGameDialogComponent {

  private static readonly NAME_MIN_LENGTH: number = 4;
  private static readonly OBJECT_QTY_MIN: number = 10;
  private static readonly OBJECT_QTY_MAX: number = 200;

  @Output() public gameCreated: EventEmitter<Game3D>;

  private name: string;
  private objectQty: string;
  private objectType: string;
  private modifType: boolean[];

  public userForm: FormGroup;

  public constructor( public dialogRef: MatDialogRef<NewFPVGameDialogComponent>,
                      public game3DThemeGeneratorService: Game3DThemeGeneratorService,
                      public game3DGenerationService: Game3DGenerationService,
                      ) {
    this.gameCreated = new EventEmitter<Game3D>();
    this.name = "";
    this.objectQty = "0";
    this.objectType = "";
    this.modifType = [false, false, false, false];

    this.userForm = new FormGroup({
      gameName: new FormControl("", [
        Validators.required,
        Validators.minLength(NewFPVGameDialogComponent.NAME_MIN_LENGTH),
        Validators.pattern("[a-z,A-Z,0-9]+"), ]),
      objectType: new FormControl("", [Validators.required]),
      objectQty: new FormControl("", [
        Validators.required,
        Validators.pattern("[0-9]+"),
        Validators.min(NewFPVGameDialogComponent.OBJECT_QTY_MIN),
        Validators.max(NewFPVGameDialogComponent.OBJECT_QTY_MAX)]),
      modifTypeAdd: new FormControl("", [Validators.required]),
      modifTypeDelete: new FormControl("", [Validators.required]),
      modifTypeColorChange: new FormControl("", [Validators.required]),
    });
  }

  public validateCheckBox(): boolean {
    return this.userForm.value.modifTypeAdd ||
    this.userForm.value.modifTypeDelete ||
    this.userForm.value.modifTypeColorChange;

  }

  public processRequest(sendRequest: boolean): void {
    this.name = this.userForm.value.gameName;
    this.objectType = this.userForm.value.objectType;
    this.objectQty = this.userForm.value.objectQty;
    if (this.userForm.value.modifTypeAdd) {
      this.modifType[ModifType.addObject] = true;
    }
    if (this.userForm.value.modifTypeDelete) {
      this.modifType[ModifType.deleteObject] = true;
    }
    if (this.userForm.value.modifTypeColorChange) {
      this.modifType[ModifType.color] = true;
      this.modifType[ModifType.texture] = true;
    }

    if (sendRequest) {
      this.sendRequest();
      this.close();
    }
  }

  public sendRequest(): void {
    if (this.objectType === Game3DType.GEOMETRIC) {
      this.game3DGenerationService.generateGame3D(this.name, this.objectQty, this.modifType).then((game: Game3D) => {
        this.gameCreated.emit(game);
      }).catch();
    } else {
      this.game3DThemeGeneratorService.generateGame3D(this.name, this.objectQty, this.modifType).then((game: Game3D) => {
        this.gameCreated.emit(game);
      }).catch();
    }
  }

  public close(): void {
    this.dialogRef.close();
  }
}
