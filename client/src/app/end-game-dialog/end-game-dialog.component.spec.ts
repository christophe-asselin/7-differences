import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EndGameDialogComponent } from "./end-game-dialog.component";

import { HttpClientModule } from "@angular/common/http";
import { MatDialogRef } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { MaterialImportsModule } from "../material-imports/material-imports.module";

const routes: Routes = [
  { path: "games/end", component: EndGameDialogComponent },
];

describe("EndGameDialogComponent", () => {
  let component: EndGameDialogComponent;
  let fixture: ComponentFixture<EndGameDialogComponent>;

  let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<EndGameDialogComponent>>;

  beforeEach(async(() => {
    matDialogRefSpy = jasmine.createSpyObj("MatDialogRef", ["close"]);

    TestBed.configureTestingModule({
      declarations: [ EndGameDialogComponent ],
      imports: [HttpClientModule,
                BrowserModule,
                MaterialImportsModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(routes)],
      providers: [{ provide: MatDialogRef, useValue: matDialogRefSpy }],
    })
    .compileComponents().then().catch();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndGameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
