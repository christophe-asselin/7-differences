import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmationDialogComponent } from "./confirmation-dialog.component";

import { HttpClientModule } from "@angular/common/http";
import { MatDialogRef } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { MaterialImportsModule } from "../material-imports/material-imports.module";

const routes: Routes = [
  { path: "games/confirmation", component: ConfirmationDialogComponent },
];

describe("ConfirmationDialogComponent", () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationDialogComponent ],
      imports: [HttpClientModule,
                BrowserModule,
                MaterialImportsModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(routes)],
      providers: [{ provide: MatDialogRef }],
    })
    .compileComponents().then().catch();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
