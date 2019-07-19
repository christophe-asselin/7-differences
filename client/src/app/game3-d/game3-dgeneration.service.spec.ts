import { TestBed } from "@angular/core/testing";

import { IObject3D } from "../../../../common/IObject3D";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Game3D } from "./Game3D";
import { ObjectComparator } from "./ObjectComparator";
import { Game3DGenerationService } from "./game3-dgeneration.service";
import { RandomObjectGenerationService } from "./random-object-generation.service";
import { RenderService } from "./render.service";
import { ScenePreviewGenerationService } from "./scene-preview-generation.service";

describe("Game3DGenerationService", () => {

  const MIN_NUMBER_OBJECTS: number = 10;
  const MAX_NUMBER_OBJECTS: number = 200;

  const NUMBER_DIFFERENCES: number = 7;
  const TEST_GAME_NAME: string = "Test Name";

  let game3DGenerationService: Game3DGenerationService;
  let randomObjectGenerationService: RandomObjectGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          Game3DGenerationService,
          RandomObjectGenerationService,
          ScenePreviewGenerationService,
          RenderService,
        ],
      });

    game3DGenerationService = TestBed.get(Game3DGenerationService);
    randomObjectGenerationService = TestBed.get(RandomObjectGenerationService);
  });

  it("should be created", () => {
    expect(game3DGenerationService).toBeTruthy();
  });

  describe("generateGame3D", () => {
    let testGame3D: Game3D;
    let numberObjects: number;

    describe("General traits of the game", () => {
      beforeAll(async () => {
        numberObjects = randomObjectGenerationService.randomNumber(MIN_NUMBER_OBJECTS, MAX_NUMBER_OBJECTS);
        testGame3D = await game3DGenerationService.generateGame3D(
          TEST_GAME_NAME,
          numberObjects.toString(),
          [true, true, true],
        );
      });

      it("should generate a game with the name specified by the user", () => {
        expect(testGame3D.name).toBe(TEST_GAME_NAME);
      });

      it("should generate a game with the number of objects specified by the user", () => {
        let numberOriginalObjects: number = testGame3D.originalObjects.length;
        while ((testGame3D.originalObjects[numberOriginalObjects - 1] as IObject3D).transparent) {
          --numberOriginalObjects;
        }
        expect(numberOriginalObjects).toBe(numberObjects);
      });

      it("should generate 7 modified objects", () => {
        expect(testGame3D.modifiedObjects.length).toBe(NUMBER_DIFFERENCES);
      });
    });

    describe("Respect of the user specified modification types", () => {
      let objectComparator: ObjectComparator;

      beforeEach(() => {
        numberObjects = randomObjectGenerationService.randomNumber(MIN_NUMBER_OBJECTS, MAX_NUMBER_OBJECTS);
        objectComparator = new ObjectComparator();
      });

      it("should only add objects when addition is the only modification specified", async () => {
        testGame3D = await game3DGenerationService.generateGame3D(
          TEST_GAME_NAME,
          numberObjects.toString(),
          [true, false, false],
        );

        (testGame3D.modifiedObjects as IObject3D[]).forEach((object) => {
          const originalObject: IObject3D | IObject3DTheme = testGame3D.originalObjects[object.index];
          expect(objectComparator.haveSameColor(object, originalObject as IObject3D)).toBe(true);
          expect(objectComparator.haveSameTransparency(object, originalObject as IObject3D)).toBe(false);
          expect((originalObject as IObject3D).transparent).toBe(true);
          expect(objectComparator.haveSameGeneralTraits(object, originalObject as IObject3D)).toBe(true);
        });
      });

      it("should only delete objets when deletion is the only modification specified", async() => {
        testGame3D = await game3DGenerationService.generateGame3D(
          TEST_GAME_NAME,
          numberObjects.toString(),
          [false, true, false],
        );

        (testGame3D.modifiedObjects as IObject3D[]).forEach((object) => {
          const originalObject: IObject3D | IObject3DTheme  = testGame3D.originalObjects[object.index];
          expect(objectComparator.haveSameColor(object, originalObject as IObject3D)).toBe(true);
          expect(objectComparator.haveSameTransparency(object, originalObject as IObject3D)).toBe(false);
          expect(object.transparent).toBe(true);
          expect(objectComparator.haveSameGeneralTraits(object, originalObject as IObject3D)).toBe(true);
        });
      });

      it("should only recolor objects when recoloration is the only modification specified", async () => {
        testGame3D = await game3DGenerationService.generateGame3D(
          TEST_GAME_NAME,
          numberObjects.toString(),
          [false, false, true],
        );

        (testGame3D.modifiedObjects as IObject3D[]).forEach((object) => {
          const originalObject: IObject3D | IObject3DTheme = testGame3D.originalObjects[object.index];
          expect(objectComparator.haveSameColor(object, originalObject as IObject3D)).toBe(false);
          expect(objectComparator.haveSameTransparency(object, originalObject as IObject3D)).toBe(true);
          expect(objectComparator.haveSameGeneralTraits(object, originalObject as IObject3D)).toBe(true);
        });
      });

      it("should add or delete objects when addition and deletion are the modifications specified", async () => {
        testGame3D = await game3DGenerationService.generateGame3D(
          TEST_GAME_NAME,
          numberObjects.toString(),
          [true, true, false],
        );

        (testGame3D.modifiedObjects as IObject3D[]).forEach((object) => {
          const originalObject: IObject3D | IObject3DTheme = testGame3D.originalObjects[object.index];
          expect(objectComparator.haveSameColor(object, originalObject as IObject3D)).toBe(true);
          expect(objectComparator.haveSameTransparency(object, originalObject as IObject3D)).toBe(false);
          expect(object.transparent || (originalObject as IObject3D).transparent).toBe(true);
          expect(objectComparator.haveSameGeneralTraits(object, originalObject as IObject3D)).toBe(true);
        });
      });

      it("should add or recolor objects when addition and recoloration are the modifications specified", async () => {
        testGame3D = await game3DGenerationService.generateGame3D(
          TEST_GAME_NAME,
          numberObjects.toString(),
          [true, false, true],
        );

        (testGame3D.modifiedObjects as IObject3D[]).forEach((object) => {
          const originalObject: IObject3D | IObject3DTheme = testGame3D.originalObjects[object.index];
          const result: boolean = !objectComparator.haveSameColor(object, originalObject as IObject3D) ||
            (!objectComparator.haveSameTransparency(object, originalObject as IObject3D) && (originalObject as IObject3D).transparent);
          expect(result).toBe(true);
          expect(objectComparator.haveSameGeneralTraits(object, originalObject as IObject3D)).toBe(true);
        });
      });

      it("should delete or recolor objects when deletion and recoloration are the modifications specified", async () => {
        testGame3D = await game3DGenerationService.generateGame3D(
          TEST_GAME_NAME,
          numberObjects.toString(),
          [false, true, true],
        );

        (testGame3D.modifiedObjects as IObject3D[]).forEach((object) => {
          const originalObject: IObject3D | IObject3DTheme = testGame3D.originalObjects[object.index];
          const result: boolean = !objectComparator.haveSameColor(object, originalObject as IObject3D) ||
            (!objectComparator.haveSameTransparency(object, originalObject as IObject3D) && object.transparent);
          expect(result).toBe(true);
          expect(objectComparator.haveSameGeneralTraits(object, originalObject as IObject3D)).toBe(true);
        });
      });

      it("should add, delete or recolor objects when all modifications are specified", async () => {
        testGame3D = await game3DGenerationService.generateGame3D(
          TEST_GAME_NAME,
          numberObjects.toString(),
          [true, true, true],
        );

        (testGame3D.modifiedObjects as IObject3D[]).forEach((object) => {
          const originalObject: IObject3D | IObject3DTheme = testGame3D.originalObjects[object.index];
          const result: boolean = !objectComparator.haveSameColor(object, originalObject as IObject3D) ||
            (!objectComparator.haveSameTransparency(object, originalObject as IObject3D));
          expect(result).toBe(true);
          expect(objectComparator.haveSameGeneralTraits(object, originalObject as IObject3D)).toBe(true);
        });
      });
    });
  });
});
