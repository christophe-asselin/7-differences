import { TestBed } from "@angular/core/testing";
import * as socketIo from "socket.io-client";
import { SocketService } from "./socket.service";

let socketService: SocketService;
let socketSpy: jasmine.SpyObj<SocketIOClient.Socket>;

describe("SocketService", () => {

  beforeEach(() => {
    socketSpy = jasmine.createSpyObj("SocketIOClient.Socket", ["emit"]);

    TestBed.configureTestingModule({
    providers: [{provide: socketIo, useValue: socketSpy}],
    });

    socketService = TestBed.get(SocketService);
  });

  it("should create", () => {
    expect(socketService).toBeTruthy();
  });

  describe("#1 socketIOClient", () => {
    it("#1.1 Should initialise socketIOClient", () => {
      expect(socketService.getSocket()).toBeTruthy();
    });
  });

  describe("#2 initSocket(username: string)", () => {
    it("#1.2 Should update user attribute when initSocket is called", () => {
      socketService.initSocket("thomas");
      expect(socketService.getUser()).toEqual({username: "thomas", userId: "/#" + socketService.getSocket().id});
    });
  });

  describe("#3 emit", () => {
    it("#1.3 Should call 'emit' with the right args when initSocket() is called", () => {
      const spy: jasmine.Spy = spyOn(socketService.getSocket(), "emit");
      socketService.initSocket("agathe");

      expect(spy.calls.mostRecent().args[0]).toBe("newUser");
      expect(spy.calls.mostRecent().args[1]).toBe(socketService.getUser());
      expect(socketService.getUser().username).toBe("agathe");
    });
  });

});
