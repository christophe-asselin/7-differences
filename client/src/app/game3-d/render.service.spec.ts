import { TestBed } from "@angular/core/testing";
import { Game3DType } from "../../../../common/Game3DType";
import { GameState, GameType } from "../../../../common/GameEnum";
import { IFreeGame } from "../../../../common/IFreeGame";
import { IObject3D } from "../../../../common/IObject3D";
import { Color, ConstCamera } from "./Enum";
import { Game3D } from "./Game3D";
import { ObjectComparator } from "./ObjectComparator";
import { Game3DGenerationService } from "./game3-dgeneration.service";
import { Object3DConversionService } from "./object3-dconversion.service";
import { RenderService } from "./render.service";

class VisibilityVerifier {
    public verify(renderService: RenderService, index: number, expectation: boolean): boolean {
        const originalObject: THREE.Mesh = ((renderService.originalObjects.children[index] as THREE.Mesh));
        const modifiedlObject: THREE.Mesh = ((renderService.modifiedObjects.children[index] as THREE.Mesh));

        return (((originalObject).material as THREE.MeshStandardMaterial).visible === expectation) &&
            (((modifiedlObject).material as THREE.MeshStandardMaterial).visible === expectation);
    }
}

describe("RenderService", () => {
    const HEX_BASE: number = 16;
    const OBJECTS_INDEX: number = 2;

    const originalContainer: HTMLDivElement = document.createElement("div");
    const modifiedContainer: HTMLDivElement = document.createElement("div");

    let renderService: RenderService;
    let game3DgenerationService: Game3DGenerationService;
    let objectComparator: ObjectComparator;
    let visibilityVerifier: VisibilityVerifier;

    let game3D: Game3D;
    let freeGame: IFreeGame;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [RenderService, Object3DConversionService],
        });

        renderService = TestBed.get(RenderService);
        game3DgenerationService = TestBed.get(Game3DGenerationService);
        objectComparator = new ObjectComparator();

        game3D = await game3DgenerationService.generateGame3D(
            "TEST GAME",
            "100",
            [true, true, true, true],
        );
        freeGame = {
            _id: "1",
            name: game3D.name,
            type: GameType.FREE,
            game3Dtype: Game3DType.GEOMETRIC,
            originalImageURL: game3D.originalImageURL,
            scoreSolo: [],
            scoreDuo: [],
            originalObjects: game3D.originalObjects as IObject3D[],
            modifiedObjects: game3D.modifiedObjects as IObject3D[],
            state: GameState.NOT_WAITING,
        };

        await renderService.initialize(originalContainer, modifiedContainer, freeGame);

    });

    it("should be created", () => {
        expect(renderService).toBeTruthy();
    });

    describe("#1 initialize", () => {

        it("should configure the camera with the correct viewing frustum", () => {
            expect(renderService.camera.fov).toBe(Math.floor(ConstCamera.fieldOfView));
            expect(renderService.camera.near).toBe(ConstCamera.nearClippingPane);
            expect(renderService.camera.far).toBe(ConstCamera.farClippingPane);
            expect(renderService.camera.position.z).toBe(ConstCamera.cameraZ);
        });

        describe("#1.1 Original Scene Generation", () => {

            it("#1.1.1 should generate an original scene containing the original objects", () => {
                for (const object of freeGame.originalObjects) {
                    const objectOriginal3D: IObject3D = Object3DConversionService.generateObject3D(
                        renderService.originalScene.children[OBJECTS_INDEX].children[object.index] as THREE.Mesh,
                    );
                    expect(objectComparator.areEqual(objectOriginal3D, object as IObject3D)).toBe(true);
                }
            });

            it("#1.1.2 should generate an original scene containing an ambient light and a directional light", () => {
                expect(renderService.originalScene.children[0].type).toBe("AmbientLight");
                expect(renderService.originalScene.children[1].type).toBe("DirectionalLight");
            });

            it("#1.1.3 should generate an original scene with the correct background color", () => {
                expect((renderService.originalScene.background as THREE.Color).getHexString()).toBe(Color.SceneGeoColor.toString(HEX_BASE));
            });
        });

        describe("#1.2 Modified Scene Generation", () => {

            it("#1.2.1 should generate a modified scene containing the modified objects and the remaining original objects", () => {
                const modifiedSceneObjects: IObject3D[] = freeGame.originalObjects as IObject3D[];
                for (const object of freeGame.modifiedObjects) {
                    modifiedSceneObjects[object.index] = object as IObject3D;
                }
                const INDEX: number = 2;
                for (const object of modifiedSceneObjects) {
                    const objectOriginal3D: IObject3D = Object3DConversionService.generateObject3D(
                        renderService.modifiedScene.children[INDEX].children[object.index] as THREE.Mesh,
                    );
                    expect(objectComparator.areEqual(objectOriginal3D, object)).toBe(true);
                }
            });

            it("#1.2.2 should generate a modified scene containing an ambient light and a directional light", () => {
                expect(renderService.modifiedScene.children[0].type).toBe("AmbientLight");
                expect(renderService.modifiedScene.children[1].type).toBe("DirectionalLight");
            });

            it("#1.2.3 hould generate a modified scene with the correct background color", () => {
                expect((renderService.modifiedScene.background as THREE.Color).getHexString()).toBe(Color.SceneGeoColor.toString(HEX_BASE));
            });
        });
    });

    describe("#2 restoreDifference", () => {
        it("#2.1 should equalize the objects in both scene after restoring all differences", () => {
            for (const object of freeGame.modifiedObjects) {
                renderService.restoreDifference(object.index);
            }
            for (let i: number = 0; i < renderService.originalObjects.children.length; ++i) {
                expect(objectComparator.areEqualMesh(
                    renderService.originalObjects.children[i] as THREE.Mesh,
                    renderService.modifiedObjects.children[i] as THREE.Mesh,
                ));
            }
        });
    });

    describe("#3 CheatMode", () => {
        const INTERVAL: number = 250;
        const SECOND: number = 1000;
        visibilityVerifier = new VisibilityVerifier();

        beforeAll(() => {
            jasmine.clock().install();
          });

        afterAll(() => {
            jasmine.clock().uninstall();
        });

        describe("#3.1 activateCheatMode", () => {
            it("should toggle the visibility of the modified objects at a 250 ms interval", () => {
                renderService.activateCheatMode();
                for (const index of renderService.modifiedObjectsIndexes) {
                    expect(visibilityVerifier.verify(renderService, index, true)).toBe(true);
                }
                jasmine.clock().tick(INTERVAL);
                for (const index of renderService.modifiedObjectsIndexes) {
                    expect(visibilityVerifier.verify(renderService, index, false)).toBe(true);
                }
                jasmine.clock().tick(INTERVAL);
                for (const index of renderService.modifiedObjectsIndexes) {
                    expect(visibilityVerifier.verify(renderService, index, true)).toBe(true);
                }
                jasmine.clock().tick(INTERVAL);
                for (const index of renderService.modifiedObjectsIndexes) {
                    expect(visibilityVerifier.verify(renderService, index, false)).toBe(true);
                }
            });
        });

        describe("#3.2 deactivateCheatMode", () => {
            it("should make the modified objects always visible", () => {
                renderService.activateCheatMode();
                jasmine.clock().tick(SECOND);
                renderService.deactivateCheatMode();

                for (const index of renderService.modifiedObjectsIndexes) {
                    expect(visibilityVerifier.verify(renderService, index, true)).toBe(true);
                }
                jasmine.clock().tick(INTERVAL);
                for (const index of renderService.modifiedObjectsIndexes) {
                    expect(visibilityVerifier.verify(renderService, index, true)).toBe(true);
                }
                jasmine.clock().tick(INTERVAL);
                for (const index of renderService.modifiedObjectsIndexes) {
                    expect(visibilityVerifier.verify(renderService, index, true)).toBe(true);
                }
                jasmine.clock().tick(INTERVAL);
                for (const index of renderService.modifiedObjectsIndexes) {
                    expect(visibilityVerifier.verify(renderService, index, true)).toBe(true);
                }
            });
        });
    });
});
