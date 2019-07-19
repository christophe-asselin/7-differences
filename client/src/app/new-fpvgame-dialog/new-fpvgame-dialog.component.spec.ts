import { HttpClient, HttpHandler } from "@angular/common/http";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { RenderService } from "../game3-d/render.service";
import { MaterialImportsModule } from "../material-imports/material-imports.module";
import { ImageService } from "../services/image.service";
import { NewFPVGameDialogComponent } from "./new-fpvgame-dialog.component";

describe("NewFPVGameDialogComponent", () => {
  let component: NewFPVGameDialogComponent;
  let fixture: ComponentFixture<NewFPVGameDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    declarations: [ NewFPVGameDialogComponent ],
    imports: [FormsModule, MaterialImportsModule, ReactiveFormsModule],
    providers: [HttpClient, HttpHandler, ImageService, RenderService,
                { provide: MatDialogRef, useValue: {} },
               ],
    }).compileComponents().then().catch();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFPVGameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("processRequest", () => {

    it("#1.1 should attempt to send the request when the submit button is enabled and clicked", () => {
      const submitButton: HTMLElement = fixture.debugElement.query(
                                  By.css(".submit-button button")).nativeElement;
      submitButton.removeAttribute("disabled");
      spyOn(component, "processRequest");
      submitButton.click();
      fixture.detectChanges();
      expect(component.processRequest).toHaveBeenCalled();
    });

    it("#1.2 should close the form when the cancel button is clicked", () => {
      const cancelButton: HTMLElement = fixture.debugElement.query(
                                  By.css(".cancel-button button")).nativeElement;
      spyOn(component, "close");
      cancelButton.click();
      fixture.detectChanges();
      expect(component.close).toHaveBeenCalled();
    });

    it("#2.1 should validate checkbox when one checkbox is checked", () => {
      component.userForm.value.modifTypeAdd = true;
      expect(component.validateCheckBox()).toEqual(true);
    });

    it("#3.1 should assert name entered by user to name attribute", () => {
      const nameInput: HTMLInputElement = fixture.nativeElement.querySelector("#gameName");
      nameInput.value = "Test";
      nameInput.dispatchEvent(new Event("input"));
      component.processRequest(false);
      const name: string | File | null = component["name"];
      expect(nameInput.value === name).toBe(true);
    });

    it("#4.1 should assert object quantity entered by user to objQty attribute", () => {
      const qtyInput: HTMLInputElement = fixture.nativeElement.querySelector("#objectQty");
      qtyInput.value = "25";
      qtyInput.dispatchEvent(new Event("input"));
      component.processRequest(false);
      const qty: string | File | null = component["objectQty"];
      expect(qtyInput.value === qty).toBe(true);
    });

    it("#5.1 should assert object type entered by user to objType attribute", () => {
      component.userForm.value.objectType = "geometricForm";
      component.processRequest(false);
      const type: string | File | null = component["objectType"];
      expect(type === "geometricForm").toBe(true);
    });

    it("#6.1 should assert the add modification to modif attribute", () => {
      component.userForm.value.modifTypeAdd = true;
      component.userForm.value.modifTypeDelete = false;
      component.userForm.value.modifTypeColorChange = false;
      component.processRequest(false);
      const modif: boolean[] = component["modifType"];
      expect(modif.toString() === "true,false,false,false").toBe(true);

    });

    it("#6.2 should assert the add and delete modifications to modif attribute", () => {
      component.userForm.value.modifTypeAdd = true;
      component.userForm.value.modifTypeDelete = true;
      component.userForm.value.modifTypeColorChange = false;
      component.processRequest(false);
      const modif: boolean[] = component["modifType"];
      expect(modif.toString() === "true,true,false,false").toBe(true);
    });

    it("#6.3 should assert the add, delete and color modifications to modif attribute", () => {
      component.userForm.value.modifTypeAdd = true;
      component.userForm.value.modifTypeDelete = true;
      component.userForm.value.modifTypeColorChange = true;
      component.processRequest(false);
      const modif: boolean[] = component["modifType"];
      expect(modif.toString() === "true,true,true,true").toBe(true);
    });
  });

  describe("formValidity", () => {
    it("#1.1 should disable Submit button when there is no input for the name of the game", () => {
      const nameInput: HTMLInputElement = fixture.nativeElement.querySelector("#gameName");
      nameInput.value = "";
      nameInput.dispatchEvent(new Event("input"));
      expect(fixture.nativeElement.querySelector("#submit").disabled).toBeTruthy();
    });

    it("#1.2 should disable Submit button when input for the name of the game's length is less than 4", () => {
      const nameInput: HTMLInputElement = fixture.nativeElement.querySelector("#gameName");
      nameInput.value = "hey";
      nameInput.dispatchEvent(new Event("input"));
      expect(fixture.nativeElement.querySelector("#submit").disabled).toBeTruthy();
    });

    it("#1.3 should disable Submit button when input for the name of the game is empty", () => {
      const nameInput: HTMLInputElement = fixture.nativeElement.querySelector("#gameName");
      nameInput.value = "    ";
      nameInput.dispatchEvent(new Event("input"));
      expect(fixture.nativeElement.querySelector("#submit").disabled).toBeTruthy();
    });

    it("#2.1 should disable Submit button when input for the quantity of objects is empty", () => {
      const objectQtyInput: HTMLInputElement = fixture.nativeElement.querySelector("#objectQty");
      objectQtyInput.value = "";
      objectQtyInput.dispatchEvent(new Event("input"));
      expect(fixture.nativeElement.querySelector("#submit").disabled).toBeTruthy();
    });

    it("#2.2 should disable Submit button when input for the quantity of objects is less than 10", () => {
      const objectQtyInput: HTMLInputElement = fixture.nativeElement.querySelector("#objectQty");
      objectQtyInput.value = "8";
      objectQtyInput.dispatchEvent(new Event("input"));
      expect(fixture.nativeElement.querySelector("#submit").disabled).toBeTruthy();
    });

    it("#2.3 should disable Submit button when input for the quantity of objects is more than 200", () => {
      const objectQtyInput: HTMLInputElement = fixture.nativeElement.querySelector("#objectQty");
      objectQtyInput.value = "208";
      objectQtyInput.dispatchEvent(new Event("input"));
      expect(fixture.nativeElement.querySelector("#submit").disabled).toBeTruthy();
    });

    it("#3.1 should disable Submit button when input for the object type is not available", () => {
      const objectQtyInput: HTMLInputElement = fixture.nativeElement.querySelector("#objectType");
      objectQtyInput.value = "notAnOption";
      objectQtyInput.dispatchEvent(new Event("input"));
      expect(fixture.nativeElement.querySelector("#submit").disabled).toBeTruthy();
    });

    it("#3.2 should disable Submit button when input for the object type is not selected", () => {
      const objectQtyInput: HTMLInputElement = fixture.nativeElement.querySelector("#objectType");
      objectQtyInput.value = "";
      objectQtyInput.dispatchEvent(new Event("input"));
      expect(fixture.nativeElement.querySelector("#submit").disabled).toBeTruthy();
    });
  });

});
