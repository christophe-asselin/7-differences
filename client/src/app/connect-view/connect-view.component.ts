import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ConnectService } from "../services/connect.service";
import { PopupService } from "../services/popup.service";
import { SocketService } from "../services/socket.service";

@Component({
  selector: "app-connect-view",
  templateUrl: "./connect-view.component.html",
  styleUrls: ["./connect-view.component.css"],
})
export class ConnectViewComponent {

  private static readonly MIN_LENGTH: number = 4;
  private static readonly MAX_LENGTH: number = 12;

  public username: string;
  public usernameFormControl: FormControl;

  public constructor(private connectService: ConnectService,
                     public router: Router,
                     private socketService: SocketService,
                     private popupService: PopupService) {
      this.username = "";
      this.usernameFormControl = new FormControl("", [
        Validators.required,
        Validators.minLength(ConnectViewComponent.MIN_LENGTH),
        Validators.maxLength(ConnectViewComponent.MAX_LENGTH),
        Validators.pattern("[a-z,A-Z,0-9]+"),
      ]);
  }

  public connect(username: string): void {
    if (this.usernameFormControl.valid) {
      this.connectService.addUsername(username).subscribe((newUsername: string) => {
        this.username = newUsername;
        if (newUsername === "") {
          this.popupService.openSnackBar("Le nom \"" + username + "\" n'est pas disponible.");
        } else {
          this.socketService.initSocket(newUsername);
          // Don't resolve promise for navigating to url
          // tslint:disable-next-line: no-floating-promises
          this.router.navigateByUrl("/games");
        }
      });
    }
  }

}
