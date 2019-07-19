import { Component, EventEmitter, Output } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { ICoordinate } from "../../../../common/ICoordinate";
import { INewSimpleGameInfos } from "../../../../common/INewSimpleGameInfos";
import { IImageValidationMessage } from "../../../../common/communication/IImageValidationMessage";
import { Title } from "../../../../common/communication/TitleEnum";
import { ImageService } from "../services/image.service";
import { PopupService } from "../services/popup.service";

@Component({
  selector: "app-new-spvgame-dialog",
  templateUrl: "./new-spvgame-dialog.component.html",
  styleUrls: ["./new-spvgame-dialog.component.css"],
})
export class NewSPVGameDialogComponent {

  private static readonly NAME_MIN_LENGTH: number = 4;
  private static readonly TYPE_IMAGE: string = "image/bmp";

  @Output() public gameCreated: EventEmitter<INewSimpleGameInfos>;

  private formData: FormData;
  private originalImage: File;
  private modifiedImage: File;
  private name: string;

  public nameFormControl: FormControl;
  public origImageFormControl: FormControl;
  public modImageFormControl: FormControl;

  public constructor( public dialogRef: MatDialogRef<NewSPVGameDialogComponent>,
                      private imageService: ImageService,
                      private popupService: PopupService) {
    this.gameCreated = new EventEmitter<INewSimpleGameInfos>();
    this.formData = new FormData();
    this.nameFormControl = new FormControl("", [
      Validators.required,
      Validators.minLength(NewSPVGameDialogComponent.NAME_MIN_LENGTH),
      Validators.pattern("[a-z,A-Z,0-9]+"), ]);
    this.origImageFormControl  = new FormControl("", [Validators.required, ]);
    this.modImageFormControl  = new FormControl("", [Validators.required, ]);
  }

  public handleOriginalImage(file: File): boolean {
    if (file.type !== NewSPVGameDialogComponent.TYPE_IMAGE) {
      this.popupService.openSnackBar("L'image doit être dans le format .bmp");

      return false;
    } else {
      this.originalImage = file;
      this.formData.append("originalImage", file);

      return true;
    }
  }

  public handleModifiedImage(file: File): boolean {
    if (file.type !== NewSPVGameDialogComponent.TYPE_IMAGE) {
      this.popupService.openSnackBar("L'image doit être dans le format .bmp");

      return false;
    } else {
      this.modifiedImage = file;
      this.formData.append("modifiedImage", file);

      return true;
    }
  }

  public sendRequest(name: string): boolean {
    this.name = name;
    const hasIncorrectImages: boolean = !(this.formData.has("originalImage") && this.formData.has("modifiedImage"));
    if (hasIncorrectImages) {
      this.popupService.openSnackBar("Erreur: Veuillez vous assurer que les images soient en format .bmp");

      return false;
    }

    this.verifyImage();
    this.close();

    return true;
  }

  private verifyImage(): void {
    this.imageService.verifyImage(this.formData).subscribe((message: IImageValidationMessage) => {
      if (message.title !== Title.FAIL) {
          const newGameInfos: INewSimpleGameInfos = {
            name: this.name,
            originalImage: this.originalImage as File,
            modifiedImage: this.modifiedImage as File,
            differenceRegions: message.differenceRegions as ICoordinate[][],
          };
          this.gameCreated.emit(newGameInfos);
      } else {
          this.popupService.openSnackBar("Erreur: " + message.body);
      }
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

}
