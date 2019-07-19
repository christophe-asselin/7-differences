import { TestBed } from "@angular/core/testing";
import * as THREE from "three";
import { MaterialColor } from "./Enum";
import { RandomObjectGenerationService } from "./random-object-generation.service";

class Validator {
  public validateVector(vector: THREE.Vector3, min: number, max: number): boolean {
    return  (vector.x >= min && vector.x <= max) &&
            (vector.y >= min && vector.y <= max) &&
            (vector.z >= min && vector.z <= max);
  }
}

describe("RandomObjectGenerationService", () => {
  let randomObjectGenerationService: RandomObjectGenerationService;
  let object: THREE.Mesh;

  const vectorValidator: Validator = new Validator();
  const NUMBER_OF_ATTEMPTS: number = 50;

  const minPosition: number = -50;
  const maxPosition: number = 50;

  const minScale: number = 0.5;
  const maxScale: number = 1.5;

  const colors: MaterialColor[] = [
    MaterialColor.Red, MaterialColor.Pink, MaterialColor.Purple, MaterialColor.DeepPurple,
    MaterialColor.Indigo, MaterialColor.Blue, MaterialColor.LightBlue, MaterialColor.Cyan, MaterialColor.Teal,
    MaterialColor.Green, MaterialColor.LightGreen, MaterialColor.Lime, MaterialColor.Yellow, MaterialColor.Amber,
    MaterialColor.Orange, MaterialColor.Brown, MaterialColor.Grey, MaterialColor.BlueGrey,
  ];
  const geometries: string[] = [
    "BoxGeometry", "SphereGeometry", "ConeGeometry",
    "CylinderGeometry", "PyramidGeometry",
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RandomObjectGenerationService],
    });

    randomObjectGenerationService = TestBed.get(RandomObjectGenerationService);
    object = new THREE.Mesh();
  });

  it("should be created", () => {
    expect(randomObjectGenerationService).toBeTruthy();
  });

  describe("randomNumber", () => {

    it("should generate random numbers between the specified bounds", () => {
      const min: number = -100;
      const max: number = 100;
      for (let i: number = 0; i < NUMBER_OF_ATTEMPTS; ++i) {
        const randomNumber: number = randomObjectGenerationService.randomNumber(min, max);
        expect(randomNumber).toBeGreaterThanOrEqual(min);
        expect(randomNumber).toBeLessThanOrEqual(max);
      }
    });

    it("should generate the number specified by the bounds when they are the same", () => {
      const sameValue: number = 10;
      expect(randomObjectGenerationService.randomNumber(sameValue, sameValue)).toBe(sameValue);
    });

    it("should throw an error when the lower bound is greater than the upper bound", () => {
      const min: number = 100;
      const max: number = -100;
      expect(() => randomObjectGenerationService.randomNumber(min, max)).toThrow(new Error("Invalid range"));
    });

  });

  describe("randomRotation", () => {

    it("should assign to the object a random normalized quaternion", () => {
      for (let i: number = 0; i < NUMBER_OF_ATTEMPTS; ++i) {
        randomObjectGenerationService.randomRotation(object);
        const PRECISION: number = 5;
        expect(object.quaternion.lengthSq()).toBeCloseTo(1, PRECISION);
      }
    });
  });

  describe("randomPosition", () => {

    it("should assign to the object a random position within the bounds of the scene", () => {
      for (let i: number = 0; i < NUMBER_OF_ATTEMPTS; ++i) {
        randomObjectGenerationService.randomPosition(object);
        expect(vectorValidator.validateVector(object.position, minPosition, maxPosition)).toBe(true);
      }
    });
  });

  describe("randomScale", () => {

    it("should assign to the object a random scale factor between 0,5 and 1.5", () => {
      for (let i: number = 0; i < NUMBER_OF_ATTEMPTS; ++i) {
        randomObjectGenerationService.randomScale(object);
        expect(vectorValidator.validateVector(object.scale, minScale, maxScale)).toBe(true);
      }
    });
  });

  describe("randomMaterial", () => {

    it("should assign to the object a random color among the colors in the Colors array", () => {
      for (let i: number = 0; i < NUMBER_OF_ATTEMPTS; ++i) {
        randomObjectGenerationService.randomMaterial(object);
        expect(colors.includes((object.material as THREE.MeshStandardMaterial).color.getHex())).toBe(true);
      }
    });
  });

  describe("randomGeometry", () => {

    it("should assign to the object a random geometry among the ones in the Geometries array", () => {
      for (let i: number = 0; i < NUMBER_OF_ATTEMPTS; ++i) {
        randomObjectGenerationService.randomGeometry(object);
        expect(geometries.includes(object.geometry.type)).toBe(true);
      }
    });
  });

  describe("randomObject", () => {

    it("should generate a random object with a valid geometry, color, scale,position, and rotation", () => {
      for (let i: number = 0; i < NUMBER_OF_ATTEMPTS; ++i) {
        object = randomObjectGenerationService.randomObject();
        expect(geometries.includes(object.geometry.type)).toBe(true);
        expect(colors.includes((object.material as THREE.MeshStandardMaterial).color.getHex())).toBe(true);
        expect(vectorValidator.validateVector(object.scale, minScale, maxScale)).toBe(true);
        expect(vectorValidator.validateVector(object.position, minPosition, maxPosition)).toBe(true);
        const PRECISION: number = 5;
        expect(object.quaternion.lengthSq()).toBeCloseTo(1, PRECISION);
      }
    });
  });
});
