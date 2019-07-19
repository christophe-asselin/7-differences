import { TestBed } from "@angular/core/testing";
import * as THREE from "three";
import { Game3DType } from "../../../../common/Game3DType";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Path } from "../game3-d-theme/Enum";
import { Color } from "./Enum";
import { RandomObjectGenerationService } from "./random-object-generation.service";
import { RenderService } from "./render.service";
import { ScenePreviewGenerationService } from "./scene-preview-generation.service";

describe("ScenePreviewGenerationService", () => {
  let scenePreviewGenerationService: ScenePreviewGenerationService;

  const randomObjectGenerationService: RandomObjectGenerationService = new RandomObjectGenerationService();

  const NUMBER_OF_OBJECTS: number = 20;
  const testGeoObjects: THREE.Mesh[] = [];
  for (let i: number = 0; i < NUMBER_OF_OBJECTS; ++i) {
    testGeoObjects.push(randomObjectGenerationService.randomObject());
  }

  const testThemObjects: IObject3DTheme[] = [];
  const scale: number = 0.5;
  for (let i: number = 0; i < NUMBER_OF_OBJECTS; ++i) {
    const object: IObject3DTheme = {
      path: Path.Tree,
      position: [0, 1, 1],
      scale: [scale, scale, scale],
      rotation: [0, 0, 0],
      transparent: false,
      index: i,
    };
    testThemObjects.push(object);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RenderService],
    });

    scenePreviewGenerationService = TestBed.get(ScenePreviewGenerationService);
  });

  it("should be created", () => {
    expect(scenePreviewGenerationService).toBeTruthy();
  });

  describe("getImageOriginalURL", () => {
    let dataURL: string;

    it("should not return a string with empty data", async() => {
      dataURL = await scenePreviewGenerationService.getImageOriginalURL(Game3DType.GEOMETRIC, testGeoObjects);
      expect(dataURL).not.toBe("data:,");
    });

    it("should return a representation of the scene in the image/png format", async() => {
      dataURL = await scenePreviewGenerationService.getImageOriginalURL(Game3DType.GEOMETRIC, testGeoObjects);
      expect(dataURL.startsWith("data:image/png")).toBe(true);
    });

    it("geometric : should create a scene with the right background color, the right light and the objects passed as parameters", () => {
      const BASE_HEX: number = 16;
      const scenePreview: THREE.Scene = scenePreviewGenerationService["createSceneGeometricPreview"](testGeoObjects);
      let sceneContainsRightObjects: boolean = true;
      let i: number = 0;

      while (i < NUMBER_OF_OBJECTS && sceneContainsRightObjects) {
        sceneContainsRightObjects = scenePreview.children[i + 1] === testGeoObjects[i];
        ++i;
      }

      expect((scenePreview.background as THREE.Color).getHexString()).toBe(Color.SceneGeoColor.toString(BASE_HEX));
      expect((scenePreview.children[0] as THREE.Light).type).toBe("AmbientLight");
      expect(sceneContainsRightObjects).toBe(true);
    });

    it("thematic : should create a scene with the right background color, the right light, the objects passed as parameters", async() => {
      const BASE_HEX: number = 16;
      const scenePreview: THREE.Scene = await scenePreviewGenerationService["createSceneThematicPreview"](testThemObjects);
      let sceneContainsRightObjects: boolean = true;
      const startIndex: number = 2;

      for (let i: number = 2; i < NUMBER_OF_OBJECTS + startIndex; i++) {
        sceneContainsRightObjects = (scenePreview.children[i].userData.index === testThemObjects[i - startIndex].index);
      }

      expect((scenePreview.background as THREE.Color).getHexString()).toBe(Color.SceneThemColor.toString(BASE_HEX));
      expect((scenePreview.children[0] as THREE.Light).type).toBe("AmbientLight");
      expect(sceneContainsRightObjects).toBe(true);
    });
  });
});
