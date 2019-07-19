import { TestHelper } from "src/test.helper";
import { Message } from "../../../../common/communication/message";

import { Title } from "../../../../common/communication/TitleEnum";
import { ImageService } from "./image.service";

// No types for Jasmine spies
// tslint:disable-next-line:no-any
let httpClientSpy: any;
let imageService: ImageService;

describe("ImageService", () => {
  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj("HttpClient", ["post"]);
    imageService = new ImageService(httpClientSpy);
  });

  it("should create", () => {
    expect(imageService).toBeTruthy();
  });

  describe("#1 verifyImage(formData: FormData)", () => {

    it("#1.1 Should return a error if the images doesn't respect the format requested or doesn't contain 7 differences.", () => {
      const expectedMessage: Message = {title: Title.FAIL, body: "..."};
      const formDataTest: FormData = new FormData();
      httpClientSpy.post.and.returnValue(TestHelper.asyncData(expectedMessage));
      imageService.verifyImage(formDataTest).subscribe((message: Message) => {
        expect(message.title).toEqual(expectedMessage.title);
      });
    });

    it("#1.2 Should return a succes if the images respect the format requested and contain 7 differences.", () => {
      const expectedMessage: Message = {title: Title.SUCCESS, body: "..."};
      const formDataTest: FormData = new FormData();
      httpClientSpy.post.and.returnValue(TestHelper.asyncData(expectedMessage));
      imageService.verifyImage(formDataTest).subscribe((message: Message) => {
        expect(message.title).toEqual(expectedMessage.title);
      });
    });

  });

});
