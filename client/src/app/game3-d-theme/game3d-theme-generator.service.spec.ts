import { TestBed } from "@angular/core/testing";

import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Index } from "../game3-d/Enum";
import { Game3D } from "../game3-d/Game3D";
import { ScenePreviewGenerationService } from "../game3-d/scene-preview-generation.service";
import { DifferenceThematicGeneratorService } from "./difference-thematic-generator.service";
import { Game3DThemeGeneratorService } from "./game3d-theme-generator.service";
import { ThematicObjectGeneratorService } from "./thematic-object-generator.service";

describe("Game3DThemeGeneratorService", () => {
  const TEST_NAME: string = "Test";
  const OBJECT_QTY: string = "100";
  const MODIF_TYPES_LIST: boolean[] = [true, true, true, true];

  let game3DThemeGeneratorService: Game3DThemeGeneratorService;

  const scenePreviewSpy: jasmine.SpyObj<ScenePreviewGenerationService> =
  jasmine.createSpyObj("ScenePreviewGenerationService", ["getImageOriginalURL"]);

  const objectThemeSpy: jasmine.SpyObj<ThematicObjectGeneratorService> =
  jasmine.createSpyObj("ThematicObjectGeneratorService",
                       ["generateRoadX", "generateCarX", "generateCarY", "generateBusX",
                        "generateRail", "generateTrain", "generateBuilding2", "generateBusY",
                        "generateAirplane", "generateTree1", "generateRoadY", "generateBuilding1", "generateBuilding3"]);
  const diffThemeSpy: jasmine.SpyObj<DifferenceThematicGeneratorService> =
  jasmine.createSpyObj("DifferenceThematicGeneratorService", ["generateDifference"]);

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [Game3DThemeGeneratorService,
                  { provide: DifferenceThematicGeneratorService, useValue: diffThemeSpy },
                  { provide: ThematicObjectGeneratorService, useValue: objectThemeSpy },
                  { provide: ScenePreviewGenerationService, useValue: scenePreviewSpy },
                ],
    });
    game3DThemeGeneratorService = TestBed.get(Game3DThemeGeneratorService);

  });

  it("should create", () => {
    expect(game3DThemeGeneratorService).toBeTruthy();
  });

  it("#1.1 The original scene should not be empty", () => {
    game3DThemeGeneratorService.generateGame3D(TEST_NAME, OBJECT_QTY, MODIF_TYPES_LIST).then((game3D: Game3D) => {
      expect(game3D.originalObjects.length !== 0).toBeTruthy();
    }).catch();
  });

  it("#1.2 The original scene should have the correct amount of objects", () => {
    game3DThemeGeneratorService.generateGame3D(TEST_NAME, OBJECT_QTY, MODIF_TYPES_LIST).then((game3D: Game3D) => {
      const objects: IObject3DTheme[] = game3D.originalObjects as IObject3DTheme[];
      const NB_OBJECTS: number = 50;
      let NB_OBJECTS_ADD: number = 0;
      for (let i: number = objects.length - 1; i >= 0; i--) {
        if ((objects[i] as IObject3DTheme).transparent) {
          NB_OBJECTS_ADD++;
        }
      }
      expect(objects.length - NB_OBJECTS_ADD).toEqual(NB_OBJECTS);
    }).catch();
  });

  it("#1.3 There should be at least 10 differents type of objects in original scene", () => {
    game3DThemeGeneratorService.generateGame3D(TEST_NAME, OBJECT_QTY, MODIF_TYPES_LIST).then((game3D: Game3D) => {
      const objects: IObject3DTheme[] = game3D.originalObjects as IObject3DTheme[];
      const paths: string[] = [];
      for (const object of objects) {
        const notSame: boolean = paths.every((path) => path !== object.path);
        if (notSame) {
          paths.push(object.path);
        }
      }
      const nbObjects: number = 10;

      expect(paths.length).toBeGreaterThanOrEqual(nbObjects);
    }).catch();
  });

  it("#1.4 original objects positions should not be below the 0 of the z axe", () => {
    game3DThemeGeneratorService.generateGame3D(TEST_NAME, OBJECT_QTY, MODIF_TYPES_LIST).then((game3D: Game3D) => {
      const objects: IObject3DTheme[] = game3D.originalObjects as IObject3DTheme[];
      let below: boolean = false;
      for (const object of objects) {
        if (object.position[1] < 0) {
          below = true;
          break;
        }
      }

      expect(below).toBeFalsy();
    }).catch();
  });

  it("#2.1 The modified scene should have 7 difference", () => {
    game3DThemeGeneratorService.generateGame3D(TEST_NAME, OBJECT_QTY, MODIF_TYPES_LIST).then((game3D: Game3D) => {
      const modifiedObjects: IObject3DTheme[] = game3D.modifiedObjects as IObject3DTheme[];
      const nbDifference: number = 7;

      expect(modifiedObjects.length).toEqual(nbDifference);
    }).catch();
  });

  it("#2.2 There should be at least one of each type of difference", () => {
    game3DThemeGeneratorService.generateGame3D(TEST_NAME, OBJECT_QTY, MODIF_TYPES_LIST).then((game3D: Game3D) => {
      const nbDifference: number[] = [0, 0, 0];
      const originalObjects: IObject3DTheme[] = game3D.originalObjects as IObject3DTheme[];
      const modifiedObjects: IObject3DTheme[] = game3D.modifiedObjects as IObject3DTheme[];
      for (const originalObject of originalObjects) {
        let add: boolean = true;
        let supp: boolean = true;
        let samePath: boolean = true;
        for (const modifiedObject of modifiedObjects) {
          samePath = originalObject.path === modifiedObject.path;
          const samePosition: boolean = ((originalObject.position[0] === modifiedObject.position[0]) &&
                                        (originalObject.position[1] === modifiedObject.position[1]) &&
                                        (originalObject.position[Index.two] === modifiedObject.position[Index.two]));
          const sameScale: boolean = (originalObject.scale[0] === modifiedObject.scale[0]); // [0], [1] and [2] are the same
          const sameRotation: boolean = ((originalObject.rotation[0] === modifiedObject.rotation[0]) &&
                                        (originalObject.rotation[1] === modifiedObject.rotation[1]) &&
                                        (originalObject.rotation[Index.two] === modifiedObject.rotation[Index.two]));
          const isSame: boolean = samePath && samePosition && sameScale && sameRotation;
          if (isSame) { supp = false; add = false; }
        }
        if (!samePath) { nbDifference[0] += 1; }
        if (!add) { nbDifference[1] += 1; }
        if (!supp) { nbDifference[Index.two] += 1; }
      }

      const result: boolean = (nbDifference[0] > 0) && (nbDifference[1] > 0) && (nbDifference[Index.two] > 0);
      expect(result).toBeTruthy();
    }).catch();
  });

});
