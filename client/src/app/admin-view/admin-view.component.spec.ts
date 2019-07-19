import { HttpClientModule } from "@angular/common/http";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { MaterialImportsModule } from "../material-imports/material-imports.module";

import { GamesListViewComponent } from "../games-list-view/games-list-view.component";
import { NewFPVGameDialogComponent } from "../new-fpvgame-dialog/new-fpvgame-dialog.component";
import { NewSPVGameDialogComponent } from "../new-spvgame-dialog/new-spvgame-dialog.component";
import { AdminViewComponent } from "./admin-view.component";

const routes: Routes = [
  { path: "admin", component: AdminViewComponent },
];

describe("AdminViewComponent", () => {
  let component: AdminViewComponent;
  let fixture: ComponentFixture<AdminViewComponent>;

  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async(() => {
    matDialogSpy = jasmine.createSpyObj("MatDialog", ["open"]);

    TestBed.configureTestingModule({
      declarations: [ AdminViewComponent,
                      NewSPVGameDialogComponent,
                      NewFPVGameDialogComponent,
                      GamesListViewComponent ],
      imports: [FormsModule,
                MaterialImportsModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                HttpClientModule,
                RouterModule.forRoot(routes)],
      providers: [{provide: MatDialog, useValue: matDialogSpy}],
    }).compileComponents().then().catch();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
