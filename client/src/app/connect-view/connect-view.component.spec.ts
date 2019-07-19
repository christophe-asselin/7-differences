import { HttpClientModule } from "@angular/common/http";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Router, RouterModule, Routes } from "@angular/router";
import { of } from "rxjs";
import { MaterialImportsModule } from "../material-imports/material-imports.module";

import { GamesListViewComponent } from "../games-list-view/games-list-view.component";
import { ConnectService } from "../services/connect.service";
import { SocketService } from "../services/socket.service";
import { ConnectViewComponent } from "./connect-view.component";

const routes: Routes = [
  { path: "", redirectTo: "/connect", pathMatch: "full" },
  { path: "connect", component: ConnectViewComponent },
  { path: "games", component: GamesListViewComponent },
];

describe("ConnectViewComponent", () => {
  let component: ConnectViewComponent;
  let fixture: ComponentFixture<ConnectViewComponent>;
  let connectSpy: jasmine.SpyObj<ConnectService>;
  let socketSpy: jasmine.SpyObj<SocketService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    connectSpy = jasmine.createSpyObj("ConnectService", ["addUsername"]);
    socketSpy = jasmine.createSpyObj("SocketService", ["initSocket"]);
    routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

    TestBed.configureTestingModule({
      declarations: [ConnectViewComponent, GamesListViewComponent],
      imports: [HttpClientModule,
                BrowserModule,
                MaterialImportsModule,
                BrowserAnimationsModule,
                RouterModule.forRoot(routes),
                ],
      providers: [{provide: ConnectService, useValue: connectSpy},
                  {provide: SocketService, useValue: socketSpy},
                  {provide: Router, useValue: routerSpy}],
      }).compileComponents().then().catch();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#1 usernameFormControl", () => {

    it("#1.1 Should refuse to connect input longer than 12 caracters", () => {
      const badName: string = "PolytechniqueMontreal";
      component.usernameFormControl.setValue(badName);
      expect(component.usernameFormControl.valid).toEqual(false);
    });

    it("#1.2 Should refuse to connect input shorter than 3 caracters", () => {
      const badName: string = "git";
      component.usernameFormControl.setValue(badName);
      expect(component.usernameFormControl.valid).toEqual(false);
    });

    it("#1.3 Should refuse to connect special caracters", () => {
      const badName: string = "!@#$%";
      component.usernameFormControl.setValue(badName);
      expect(component.usernameFormControl.valid).toEqual(false);
    });

    it("#1.4 Should refuse to connect if input is empty", () => {
      const badName: string = "";
      component.usernameFormControl.setValue(badName);
      expect(component.usernameFormControl.valid).toEqual(false);
    });

    it("#1.5 Should connect with valid input", () => {
      const validName: string = "gregoire";
      component.usernameFormControl.setValue(validName);
      expect(component.usernameFormControl.valid).toEqual(true);
    });

  });

  describe("#2 connect(username: string)", () => {

    it("#2.1 Should connect if valid username is not already taken", (done) => {
      const expectedReturnValue: string = "thomas";

      connectSpy.addUsername.and.returnValue(of(expectedReturnValue));
      component.usernameFormControl.setValue("thomas");

      component.connect("thomas");

      connectSpy.addUsername.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        expect(socketSpy.initSocket).toHaveBeenCalled();
        expect(component.username).toEqual(expectedReturnValue);
        expect(routerSpy.navigateByUrl).toHaveBeenCalled();
        done();
      });
    });

    it("#2.2 Should not connect if valid username is already taken", (done) => {
      const expectedReturnValue: string = "";

      connectSpy.addUsername.and.returnValue(of(expectedReturnValue));
      component.usernameFormControl.setValue("thomas");

      component.connect("thomas");

      connectSpy.addUsername.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();
        expect(socketSpy.initSocket).not.toHaveBeenCalled();
        expect(component.username).toEqual(expectedReturnValue);
        expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
        done();
      });
    });

  });

});
