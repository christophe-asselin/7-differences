import { TestHelper } from "src/test.helper";

import { IDifferenceIdentificationMessage } from "../../../../common/communication/IDifferenceIdentificationMessage";
import { Title } from "../../../../common/communication/TitleEnum";
import { SimpleDifferenceService } from "./simple-difference.service";

// No types for Jasmine spies
// tslint:disable-next-line: no-any
let httpClientSpy: any;
let service: SimpleDifferenceService;

describe("SimpleDifferenceService", () => {
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj("HttpClient", ["post"]);
    service = new SimpleDifferenceService(httpClientSpy);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("1.1 Should return an IDifferenceIdentificationMessage with the correct data if parameters are valid", () => {
    const TEST_NAME: string = "test";
    const X: number = 32;
    const Y: number = 64;
    const EXPECTED_MESSAGE: IDifferenceIdentificationMessage = {
      title: Title.SUCCESS, coordinates: [{x: X, y: Y}], differenceIdentified: true,
    };
    httpClientSpy.post.and.returnValue(TestHelper.asyncData(EXPECTED_MESSAGE));
    const formDataTest: FormData = new FormData();
    service.checkIfDifference(TEST_NAME, X, Y, formDataTest).subscribe((message: IDifferenceIdentificationMessage) => {
      expect(message.differenceIdentified).toEqual(EXPECTED_MESSAGE.differenceIdentified);
    });
  });
});
