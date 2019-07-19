import { HttpClient, HttpHandler } from "@angular/common/http";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { MaterialImportsModule } from "../material-imports/material-imports.module";
import { ImageService } from "../services/image.service";
import { PopupService } from "../services/popup.service";
import { NewSPVGameDialogComponent } from "./new-spvgame-dialog.component";

describe("NewSPVGameDialogComponent", () => {

  let component: NewSPVGameDialogComponent;
  let fixture: ComponentFixture<NewSPVGameDialogComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let popupSpy: jasmine.SpyObj<PopupService>;

  beforeEach(async(() => {
      routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
      popupSpy = jasmine.createSpyObj("SocketService", ["openSnackBar"]);
      TestBed.configureTestingModule({
      declarations: [ NewSPVGameDialogComponent ],
      imports: [FormsModule, MaterialImportsModule, NoopAnimationsModule, ReactiveFormsModule],
      providers: [HttpClient, HttpHandler, ImageService,
                  { provide: MatDialogRef },
                  { provide: PopupService, useValue: popupSpy },
                  { provide: Router, useValue: routerSpy }],
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(NewSPVGameDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }).catch();

  }));

  const bmpFile: File = new File([""], "cat.bmp", {type: "image/bmp", lastModified: 0});
  const txtFile: File = new File([""], "cat.txt", {type: "text/plain", lastModified: 0});

  describe("#1 handleOriginalImage()", () => {

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("#1.1 should return true when input is a bmp file", () => {
      expect(component.handleOriginalImage(bmpFile)).toBe(true);
    });

    it("#1.2 should return false when input is not a bmp file", () => {
      expect(component.handleOriginalImage(txtFile)).toBe(false);
      expect(popupSpy.openSnackBar).toHaveBeenCalledWith("L'image doit être dans le format .bmp");
    });

  });

  describe("#2 handleModifiedImage()", () => {

    it("#2.1 should return true when input is a bmp file", () => {
      expect(component.handleModifiedImage(bmpFile)).toBe(true);
    });

    it("#2.2 should return false when input is not a bmp file", () => {
      expect(component.handleModifiedImage(txtFile)).toBe(false);
      expect(popupSpy.openSnackBar).toHaveBeenCalledWith("L'image doit être dans le format .bmp");
    });

  });

  describe("#3 sendRequest", () => {

    it("#3.1 should not send the request if no image is provided when submitting", () => {
      expect(component.sendRequest("fakeGame")).toBe(false);
      expect(popupSpy.openSnackBar).toHaveBeenCalledWith("Erreur: Veuillez vous assurer que les images soient en format .bmp");
    });

    it("#3.2 should not send the request if only one of the fields is filled when submitting", () => {
      component.handleModifiedImage(bmpFile);
      expect(component.sendRequest("fakeGame")).toBe(false);
      expect(popupSpy.openSnackBar).toHaveBeenCalledWith("Erreur: Veuillez vous assurer que les images soient en format .bmp");
    });

    it("#3.3 should send the request if all the required fields are filled when submitting", () => {
      component.handleOriginalImage(bmpFile);
      expect(component.sendRequest("fakeGame")).toBe(false);
      expect(popupSpy.openSnackBar).toHaveBeenCalledWith("Erreur: Veuillez vous assurer que les images soient en format .bmp");
    });

    it("#3.4 should attempt to send the request when the submit button is enabled and clicked", () => {
      const submitButton: HTMLElement = fixture.debugElement.query(
                                  By.css(".button1 button")).nativeElement;
      submitButton.removeAttribute("disabled");
      spyOn(component, "sendRequest");
      submitButton.click();
      fixture.detectChanges();
      expect(component.sendRequest).toHaveBeenCalled();
    });

    it("#3.5 should close the form when the cancel button is clicked", () => {
      const cancelButton: HTMLElement = fixture.debugElement.query(
                                  By.css(".cancel-button button")).nativeElement;
      spyOn(component, "close");
      cancelButton.click();
      fixture.detectChanges();
      expect(component.close).toHaveBeenCalled();
    });

  });
});
