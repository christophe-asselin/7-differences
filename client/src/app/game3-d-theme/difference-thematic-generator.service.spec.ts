import { TestBed } from "@angular/core/testing";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Index } from "../game3-d/Enum";
import { DifferenceThematicGeneratorService } from "./difference-thematic-generator.service";
import { ThematicObjectGeneratorService } from "./thematic-object-generator.service";

describe("DifferenceThematicGeneratorService", () => {
    let differenceThematicGeneratorService: DifferenceThematicGeneratorService;
    const modifType: boolean[] = [false, true, false, false];
    const ROADX: number = 10; const ROADY: number = 20; const NBROAD: number = 30;
    const RAILX: number = 5; const RAILY: number = 5;

    let objectThemeSpy: jasmine.SpyObj<ThematicObjectGeneratorService>;

    beforeEach(() => {
      objectThemeSpy = jasmine.createSpyObj("ThematicObjectGeneratorService",
                                            ["generateRoadX", "generateCarX",
                                             "generateBusX", "generateRail",
                                             "generateTrain", "generateBuilding2",
                                             "generateAirplane", "generateTree1])"]);
      TestBed.configureTestingModule({
        providers: [DifferenceThematicGeneratorService,
                    {provide: ThematicObjectGeneratorService, userValue: objectThemeSpy}],
      });
      differenceThematicGeneratorService = TestBed.get(DifferenceThematicGeneratorService);
      differenceThematicGeneratorService.initialize(modifType, [], []);
    });

    it("should create", () => {
      expect(differenceThematicGeneratorService).toBeTruthy();
    });

    describe("#1 Test of initialize function", () => {
      it("#1.1 All attributs should be correclty initialize", () => {
        const modification: boolean[] = [true, true, true, true];
        const objects: IObject3DTheme[] = [{path: "mypath",
                                            position: [1, 1, 1],
                                            scale: [1, 1, 1],
                                            rotation: [0, 0, 0],
                                            transparent: false,
                                            index: 0}];
        const index: number[] = [0, 1];
        differenceThematicGeneratorService.initialize(modification, objects, index);

        const sameModification: boolean = differenceThematicGeneratorService["modificationTypes"] === modification;
        const sameObjects: boolean = differenceThematicGeneratorService["originalObjects"] === objects;
        const sameIndex: boolean = differenceThematicGeneratorService["index"] === index;

        expect(sameModification && sameObjects && sameIndex).toBeTruthy();
      });
    });

    describe("#2 Test of generateDifference function", () => {
      it("#2.1 There should be 7 differences generated", () => {
        const nbDiffernce: number = 7;
        differenceThematicGeneratorService.generateDifference(ROADX, ROADY, NBROAD, RAILX, RAILY);
        expect(differenceThematicGeneratorService["modifiedObjects"].length).toEqual(nbDiffernce);
      });
    });

    describe("#3 Test of generateQtyEachDifference", () => {
      it("#3.1 There should be 7 difference in total with the difference type selected", () => {
        const quantityTable: number[] = differenceThematicGeneratorService["generateQtyEachDifference"]();
        const quantity: number = quantityTable[0] + quantityTable[1] + quantityTable[Index.two] + quantityTable[Index.three];
        const nbDiffernce: number = 7;
        expect(quantity).toEqual(nbDiffernce);
      });

      it("#3.2 There should be 7 difference in total with the difference type selected", () => {
        const modification: boolean[] = [true, true, false, true];
        differenceThematicGeneratorService.initialize(modification, [], []);
        const quantityTable: number[] = differenceThematicGeneratorService["generateQtyEachDifference"]();
        const quantity: number = quantityTable[0] + quantityTable[1] + quantityTable[Index.two] + quantityTable[Index.three];
        const nbDiffernce: number = 7;
        expect(quantity).toEqual(nbDiffernce);
      });

      it("#3.3 There should be 7 difference in total with the difference type selected", () => {
        const modification: boolean[] = [false, true, false, true];
        differenceThematicGeneratorService.initialize(modification, [], []);
        const quantityTable: number[] = differenceThematicGeneratorService["generateQtyEachDifference"]();
        const quantity: number = quantityTable[0] + quantityTable[1] + quantityTable[Index.two] + quantityTable[Index.three];
        const nbDiffernce: number = 7;
        expect(quantity).toEqual(nbDiffernce);
      });

      it("#3.4 There should be 7 difference in total with the difference type selected", () => {
        const modification: boolean[] = [false, false, false, true];
        differenceThematicGeneratorService.initialize(modification, [], []);
        const quantityTable: number[] = differenceThematicGeneratorService["generateQtyEachDifference"]();
        const quantity: number = quantityTable[0] + quantityTable[1] + quantityTable[Index.two] + quantityTable[Index.three];
        const nbDiffernce: number = 7;
        expect(quantity).toEqual(nbDiffernce);
      });
    });
});
