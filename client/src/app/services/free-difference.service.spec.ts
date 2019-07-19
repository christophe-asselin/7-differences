import { TestBed } from "@angular/core/testing";

import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestHelper } from "src/test.helper";
import * as THREE from "three";
import { ConstCamera } from "../game3-d/Enum";
import { FreeDifferenceService } from "./free-difference.service";

describe("FreeDifferenceService", () => {
  const WIDTH: number = 640;
  const HEIGHT: number = 480;

  let freeDifferenceService: FreeDifferenceService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  const RADIUS: number = 3;
  const testMesh: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(RADIUS), new THREE.MeshStandardMaterial());
  testMesh.userData.index = 0;

  const meshGroup: THREE.Group = new THREE.Group();
  meshGroup.add(testMesh);

  const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    ConstCamera.fieldOfView,
    WIDTH / HEIGHT,
    ConstCamera.nearClippingPane,
    ConstCamera.farClippingPane,
    );
  camera.position.z = ConstCamera.cameraZ;

  const clickPosition1: THREE.Vector2 = new THREE.Vector2(0, 0);
  const clickPosition2: THREE.Vector2 = new THREE.Vector2(1, 1);

  beforeEach(() => {
    const fakeHttpClient: jasmine.SpyObj<HttpClient> = jasmine.createSpyObj("HttpClient", ["get"]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FreeDifferenceService, {provide: HttpClient, useValue: fakeHttpClient}],
    });

    freeDifferenceService = TestBed.get(FreeDifferenceService);
    httpClientSpy = TestBed.get(HttpClient);

    freeDifferenceService.setOriginalSceneObjects(meshGroup);
    freeDifferenceService.setCamera(camera);
    testMesh.updateMatrix();
    camera.updateMatrix();
    camera.updateProjectionMatrix();
  });

  it("should be created", () => {
    expect(freeDifferenceService).toBeTruthy();
  });

  describe("findClickedObjectIndex", () => {

    it("should return the index 0 when clicking on the mesh in the scene", () => {
      (camera as THREE.Object3D).lookAt(1, 1, 1);
      (camera as THREE.Camera).getWorldDirection(testMesh.position);

      testMesh.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      expect(freeDifferenceService.findClickedObjectIndex(clickPosition1)).toBe(0);
    });

    it("should return the index of value -1 when clicking in an empty space", () => {
      expect(freeDifferenceService.findClickedObjectIndex(clickPosition2)).toBe(-1);
    });
  });

  describe("compareObjectInScenes", () => {
    const indexArray: number[] = [0, 1];
    const TEST_ID: string = "test";

    it("should return true if the index corresponds to a modified object", () => {
      httpClientSpy.get.and.returnValue(TestHelper.asyncData(indexArray.includes(0)));
      freeDifferenceService.compareObjectInScenes(TEST_ID, 0).subscribe((answer: boolean) => {
        expect(answer).toBe(true);
      });
    });

    it("should return false if the index does not correspond to a modified object", () => {
      const INDEX: number = 2;
      httpClientSpy.get.and.returnValue(TestHelper.asyncData(indexArray.includes(INDEX)));
      freeDifferenceService.compareObjectInScenes(TEST_ID, INDEX).subscribe((answer: boolean) => {
        expect(answer).toBe(false);
      });
    });

  });
});
