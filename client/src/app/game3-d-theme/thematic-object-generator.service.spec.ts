import { TestBed } from "@angular/core/testing";

import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { ThematicObjectGeneratorService } from "./thematic-object-generator.service";

describe("ThematicObjectGeneratorService", () => {

  let thematicObjectGeneratorService: ThematicObjectGeneratorService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [ThematicObjectGeneratorService],
    });

    thematicObjectGeneratorService = TestBed.get(ThematicObjectGeneratorService);
  });

  it("should create", () => {
    expect(thematicObjectGeneratorService).toBeTruthy();
  });

  describe("#1 Verify all generate functions", () => {

    const ROADX: number = 10;
    const ROADY: number = 20;
    const NB_ROAD: number = 5;

    const RAILX: number = 5;
    const RAILY: number = 2;
    const NB_RAIL: number = 20;

    it("#1.1 Call of generateRoadX(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateRoadX(objects, 1);
      expect(objects.length).toEqual(1);
    });

    it("#1.2 Call of generateRoadY(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateRoadY(objects, 1);
      expect(objects.length).toEqual(1);
    });

    it("#1.3 Call of generateCarX(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateCarX(objects, 1, ROADX, ROADY, NB_ROAD);
      expect(objects.length).toEqual(1);
    });

    it("#1.4 Call of generateCarY(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateCarY(objects, 1, ROADX, ROADY, NB_ROAD);
      expect(objects.length).toEqual(1);
    });

    it("#1.5 Call of generateBusX(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateBusX(objects, 1, ROADX, NB_ROAD);
      expect(objects.length).toEqual(1);
    });

    it("#1.6 Call of generateBusY(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateBusY(objects, 1, ROADX, ROADY, NB_ROAD);
      expect(objects.length).toEqual(1);
    });

    it("#1.7 Call of generateRail(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateRail(objects, 1, ROADX);
      expect(objects.length).toEqual(1);
    });

    it("#1.8 Call of generateTrain(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateTrain(objects, 1, RAILX, RAILY, NB_RAIL);
      expect(objects.length).toEqual(1);
    });

    it("#1.9 Call of generateBuilding1(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateBuilding1(objects, 1, ROADX);
      expect(objects.length).toEqual(1);
    });

    it("#1.10 Call of generateBuilding2(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateBuilding2(objects, 1, ROADX, ROADY);
      expect(objects.length).toEqual(1);
    });

    it("#1.11 Call of generateBuilding3(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateBuilding3(objects, 1, ROADX, ROADY);
      expect(objects.length).toEqual(1);
    });

    it("#1.12 Call of generateAirplane(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateAirplane(objects, 1);
      expect(objects.length).toEqual(1);
    });

    it("#1.13 Call of generateTree1(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateTree1(objects, 1, ROADX, ROADY);
      expect(objects.length).toEqual(1);
    });

    it("#1.14 Call of generateTree2(...) should add an object in the list", () => {
      const objects: IObject3DTheme[] = [];
      thematicObjectGeneratorService.generateTree2(objects, 1, ROADX, ROADY);
      expect(objects.length).toEqual(1);
    });
  });

  describe("#2 Test of validatePosition function", () => {
    it("#2.1 Should return true because the position is already occupied", () => {
      thematicObjectGeneratorService["positions"].push([0, 0, 0]);
      expect(thematicObjectGeneratorService["validatePosition"]([0, 0, 0], 1)).toBeTruthy();
    });

    it("#2.2 Should return true because the position is near an occupied position", () => {
      thematicObjectGeneratorService["positions"].push([0, 0, 0]);
      const YPOSITION: number = 5; const tolerance: number = 10;
      expect(thematicObjectGeneratorService["validatePosition"]([0, YPOSITION, 0], tolerance)).toBeTruthy();
    });

    it("#2.3 Should return false because the position is not occupied", () => {
      thematicObjectGeneratorService["positions"].push([0, 0, 0]);
      const POSITION: number = 10;
      expect(thematicObjectGeneratorService["validatePosition"]([POSITION, POSITION, POSITION], 1)).toBeFalsy();
    });
  });

  describe("#3 Test of get... function", () => {
    it("#3.1 the get function should return an non empty objet", () => {
      thematicObjectGeneratorService["index"].push(0);
      expect(thematicObjectGeneratorService.getIndexDiff().length).toBeGreaterThan(0);
    });
  });

});
