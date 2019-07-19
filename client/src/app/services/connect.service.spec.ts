import { TestHelper } from "src/test.helper";
import { ConnectService } from "./connect.service";

// No types for Jasmine spies
// tslint:disable-next-line:no-any
let httpClientSpy: any;
let connectService: ConnectService;

describe("ConnectService", () => {

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj("HttpClient", ["get"]);
    connectService = new ConnectService(httpClientSpy);
  });

  it("should create", () => {
    expect(connectService).toBeTruthy();
  });

  describe("#1 addUsername(username: string)", () => {

    it("#1.1 Should add username if valid username is available", () => {
      const expectedUsername: string = "colin";
      httpClientSpy.get.and.returnValue(TestHelper.asyncData(expectedUsername));
      connectService.addUsername("colin").subscribe((username: string) => {
        expect(username).toEqual(expectedUsername);
      });
    });

    it("#1.2 Should NOT add username if username is already taken", () => {
      const expectedUsername: string = "";
      httpClientSpy.get.and.returnValue(TestHelper.asyncData(expectedUsername));
      connectService.addUsername("jasper").subscribe((username: string) => {
         expect(username).toEqual(expectedUsername);
      });
    });

  });

});
