import { TestBed } from "@angular/core/testing";

import { IObject3D } from "../../../../common/IObject3D";
import { ObjectComparator } from "./ObjectComparator";
import { Object3DConversionService } from "./object3-dconversion.service";
import { RandomObjectGenerationService } from "./random-object-generation.service";

describe("Object3DConversionService", () => {
  let object3DConversionService: Object3DConversionService;
  let randomObjectGenerationService: RandomObjectGenerationService;
  let initialRandomObject: THREE.Mesh;
  let object3D: IObject3D;
  let convertedRandomObject: THREE.Mesh;
  let objectComparator: ObjectComparator;

  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [
      Object3DConversionService, RandomObjectGenerationService],
    });

    object3DConversionService = TestBed.get(Object3DConversionService);
    randomObjectGenerationService = TestBed.get(RandomObjectGenerationService);

    initialRandomObject = randomObjectGenerationService.randomObject();
    object3D = Object3DConversionService.generateObject3D(initialRandomObject);
    convertedRandomObject = object3DConversionService.generateThreeObject(object3D);

    objectComparator = new ObjectComparator();
  });

  it("should be created", () => {
    expect(object3DConversionService).toBeTruthy();
  });

  it("should convert a random Object3D to the corresponding Mesh object", () => {
    expect(objectComparator.areEqualMesh(initialRandomObject, convertedRandomObject)).toBe(true);
  });
});
