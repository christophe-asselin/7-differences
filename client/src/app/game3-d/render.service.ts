import { Injectable } from "@angular/core";
import * as THREE from "three";
import GLTFLoader from "three-gltf-loader";
import { Game3DType } from "../../../../common/Game3DType";
import { IFreeGame } from "../../../../common/IFreeGame";
import { IObject3D } from "../../../../common/IObject3D";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Path } from "../game3-d-theme/Enum";
import { Color, ConstCamera, Light } from "./Enum";
import { ICameraParams } from "./ICameraParams";
import { MovingCamera } from "./MovingCamera";
import { Object3DConversionService} from "./object3-dconversion.service";

@Injectable({
    providedIn: "root",
})
export class RenderService {
    private containerOriginal: HTMLDivElement;
    private rendererOriginal: THREE.WebGLRenderer;
    private containerModified: HTMLDivElement;
    private rendererModified: THREE.WebGLRenderer;
    private cheatModeInterval: number;
    private game3DType: Game3DType;
    public originalScene: THREE.Scene;
    public originalObjects: THREE.Group;
    public modifiedScene: THREE.Scene;
    public modifiedObjects: THREE.Group;
    public modifiedObjectsIndexes: number[];
    public camera: MovingCamera;
    public clock: THREE.Clock;

    public constructor (private object3DConversionService: Object3DConversionService) {
        this.originalScene = new THREE.Scene();
        this.modifiedScene = new THREE.Scene();
        this.originalObjects = new THREE.Group();
        this.modifiedObjects = new THREE.Group();
        this.modifiedObjectsIndexes = [];
        this.clock = new THREE.Clock();
    }

    public async initialize(containerOriginal: HTMLDivElement,
                            containerModified: HTMLDivElement,
                            freeGame: IFreeGame): Promise<void> {

        this.deactivateCheatMode();
        this.game3DType = freeGame.game3Dtype;
        this.containerOriginal = containerOriginal;
        this.containerModified = containerModified;

        this.setCamera();
        await this.createScenes(freeGame);
        this.startRenderingLoop();
    }

    public setCamera(): void {
        const cameraParams: ICameraParams = {
            fov: ConstCamera.fieldOfView,
            aspect: this.containerOriginal.clientWidth / this.containerOriginal.clientHeight,
            near: ConstCamera.nearClippingPane,
            far: ConstCamera.farClippingPane,
        };
        this.camera = new MovingCamera(cameraParams, this.game3DType);
        if (this.game3DType === Game3DType.GEOMETRIC) {
            this.camera.setPosition(new THREE.Vector3(0, 0, ConstCamera.cameraZ));
        } else {
            const CAMERA_XZ: number = 100;
            const CAMERA_Y: number = 5;

            this.camera.setPosition(new THREE.Vector3(CAMERA_XZ, CAMERA_Y, CAMERA_XZ));
        }
    }

    public restoreDifference(index: number): void {
        if (this.game3DType === Game3DType.GEOMETRIC) {
            ((this.originalObjects.children[index] as THREE.Mesh).material as THREE.Material).visible = true;
        } else {
            this.setMeshVisibleTrue(this.originalObjects.children[index].children);
        }
        this.modifiedObjects.children[index] = this.originalObjects.children[index].clone();
        this.deleteIndex(index);
    }

    public activateCheatMode(): void {
        const FLASH_INTERVAL: number = 250;
        this.cheatModeInterval = window.setInterval(() => {
            for (const index of this.modifiedObjectsIndexes) {
                if (this.game3DType === Game3DType.GEOMETRIC) {
                    ((this.originalObjects.children[index] as THREE.Mesh).material as THREE.MeshStandardMaterial).visible =
                    !((this.originalObjects.children[index] as THREE.Mesh).material as THREE.MeshStandardMaterial).visible;
                    ((this.modifiedObjects.children[index] as THREE.Mesh).material as THREE.MeshStandardMaterial).visible =
                    !((this.modifiedObjects.children[index] as THREE.Mesh).material as THREE.MeshStandardMaterial).visible;
                } else {
                    this.setMeshVisible(this.originalObjects.children[index].children);
                    this.setMeshVisible(this.modifiedObjects.children[index].children);
                }
            }
        },                                          FLASH_INTERVAL);
    }

    public deactivateCheatMode(): void {
        window.clearInterval(this.cheatModeInterval);
        for (const index of this.modifiedObjectsIndexes) {
            if (this.game3DType === Game3DType.GEOMETRIC) {
                ((this.originalObjects.children[index] as THREE.Mesh).material as THREE.MeshStandardMaterial).visible = true;
                ((this.modifiedObjects.children[index] as THREE.Mesh).material as THREE.MeshStandardMaterial).visible = true;
            } else {
                this.setMeshVisibleTrue(this.originalObjects.children[index].children);
                this.setMeshVisibleTrue(this.modifiedObjects.children[index].children);
            }
        }
    }

    public async loadObject(object: IObject3DTheme): Promise<THREE.Scene> {
        return new Promise((resolve: (value: THREE.Scene) => void) => {
            const loader: GLTFLoader = new GLTFLoader();
            const PATH: string = "assets/objects/" + object.path + "/scene.gltf";
            loader.load(
                PATH,
                (gltf) => {
                    const X: number = 0;
                    const Y: number = 1;
                    const Z: number = 2;
                    gltf.scene.position.set(object.position[X], object.position[Y], object.position[Z]);
                    gltf.scene.scale.set(object.scale[X], object.scale[Y], object.scale[Z]);
                    gltf.scene.rotation.set(object.rotation[X], object.rotation[Y], object.rotation[Z]);
                    gltf.scene.userData.index = object.index;
                    if (object.path !== Path.Train) {
                        this.setMeshTransparent(gltf.scene.children, object);
                    }
                    resolve(gltf.scene as THREE.Scene);
                },
                (xhr) => { // called while loading is progressing
                },
                (error) => {
                    resolve(new THREE.Scene());
                    console.error("An error happened", error);
                },
            );
        });
    }

    public generateBaseStructure(size: number): THREE.Mesh {
        let ground: THREE.Mesh;
        const path: string = "assets/texture/road2.jpg";
        ground = this.generatePlan(size);
        const position: number = 100;
        ground.position.x = position;
        ground.position.y = 0;
        ground.position.z = position;
        this.applyTexture(ground, path);
        this.originalScene.add(ground);
        this.modifiedScene.add(ground.clone());

        return ground.clone();
    }

    private async createScenes(freeGame: IFreeGame): Promise<void> {
        this.originalScene = new THREE.Scene();
        this.modifiedScene = new THREE.Scene();
        this.originalObjects = new THREE.Group();
        this.modifiedObjects = new THREE.Group();
        this.modifiedObjectsIndexes = [];
        this.generateLights();

        if (this.game3DType === Game3DType.GEOMETRIC) {
            this.createGeometricScenes(freeGame);
        } else {
            await this.createThematicScenes(freeGame);
        }
        this.originalScene.add(this.originalObjects);
        this.modifiedScene.add(this.modifiedObjects);
    }

    private createGeometricScenes(freeGame: IFreeGame): void {
        this.originalScene.background = new THREE.Color(Color.SceneGeoColor);
        this.modifiedScene.background = new THREE.Color(Color.SceneGeoColor);

        for (const object of freeGame.originalObjects) {
            const mesh: THREE.Mesh = this.object3DConversionService.generateThreeObject(object as IObject3D);
            const boundingBox: THREE.Box3 = new THREE.Box3().setFromObject(mesh);
            mesh.userData.boundingBox = boundingBox;
            this.originalObjects.add(mesh);
            this.modifiedObjects.add(mesh.clone());
        }

        for (const object of freeGame.modifiedObjects) {
            this.modifiedObjectsIndexes.push(object.index);
            this.modifiedObjects.children[object.index] = this.object3DConversionService.generateThreeObject(object as IObject3D);
        }
    }

    private async createThematicScenes(freeGame: IFreeGame): Promise<void> {
        this.originalScene.background = new THREE.Color(Color.SceneThemColor);
        this.modifiedScene.background = new THREE.Color(Color.SceneThemColor);
        const SCENE_X_MAX: number = 200;
        this.generateBaseStructure(SCENE_X_MAX);

        for (const object of freeGame.originalObjects) {
            const objectLoaded: THREE.Scene = await this.loadObject(object as IObject3DTheme);
            const boundingBox: THREE.Box3 = new THREE.Box3().setFromObject(objectLoaded);
            objectLoaded.userData.boundingBox = boundingBox;
            this.originalObjects.add(objectLoaded);
            this.modifiedObjects.add(objectLoaded.clone());
        }
        for (const object of freeGame.modifiedObjects) {
            const objectLoaded: THREE.Scene = await this.loadObject(object as IObject3DTheme);
            this.modifiedObjectsIndexes.push(object.index);
            this.modifiedObjects.children[object.index] = objectLoaded;
        }
    }

    private setMeshVisible(objects: THREE.Object3D[]): void {
        for (const object of objects) {
            if (object.type === "Mesh") {
                ((object as THREE.Mesh).material as THREE.MeshStandardMaterial).visible =
                !((object as THREE.Mesh).material as THREE.MeshStandardMaterial).visible;
            } else {
                this.setMeshVisible(object.children);
            }
        }
    }

    private setMeshVisibleTrue(objects: THREE.Object3D[]): void {
        for (const object of objects) {
            if (object.type === "Mesh") {
                ((object as THREE.Mesh).material as THREE.MeshStandardMaterial).visible = true;
            } else {
                this.setMeshVisibleTrue(object.children);
            }
        }
    }

    private setMeshTransparent(objects: THREE.Object3D[], objectInfos: IObject3DTheme): void {
        for (const object of objects) {
            if (object.type === "Mesh") {
                object.userData.index = objectInfos.index;
                ((object as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0;
                ((object as THREE.Mesh).material as THREE.MeshStandardMaterial).transparent = objectInfos.transparent;
            } else {
                this.setMeshTransparent(object.children, objectInfos);
            }
        }
    }

    private deleteIndex(objectIndex: number): void {
        const index: number = this.modifiedObjectsIndexes.findIndex((i: number) => i === objectIndex);
        this.modifiedObjectsIndexes.splice(index, 1);
    }

    private generatePlan(size: number): THREE.Mesh {
        return new THREE.Mesh(new THREE.BoxGeometry(size, 1, size), new THREE.MeshStandardMaterial({ color: Color.White }));
    }

    private applyTexture(object: THREE.Mesh, path: string): void {
        const texture: THREE.Texture = new THREE.TextureLoader().load(path);
        (object.material as THREE.MeshStandardMaterial).map = texture;
    }

    private generateLights(): void {
        const light: THREE.AmbientLight = new THREE.AmbientLight(Color.White);
        this.originalScene.add(light);
        this.modifiedScene.add(light.clone());

        const dirLight: THREE.DirectionalLight = new THREE.DirectionalLight(Color.White, Light.Dir_intensity);
        dirLight.position.set(1, 1, 1);

        this.originalScene.add(dirLight);
        this.modifiedScene.add(dirLight.clone());
    }

    private startRenderingLoop(): void {
        this.rendererOriginal = new THREE.WebGLRenderer();
        this.rendererOriginal.setPixelRatio(devicePixelRatio);
        this.rendererOriginal.setSize(this.containerOriginal.clientWidth,
                                      this.containerOriginal.clientHeight);
        this.containerOriginal.appendChild(this.rendererOriginal.domElement);
        this.rendererModified = new THREE.WebGLRenderer();
        this.rendererModified.setPixelRatio(devicePixelRatio);
        this.rendererModified.setSize(this.containerModified.clientWidth,
                                      this.containerModified.clientHeight);

        this.containerModified.appendChild(this.rendererModified.domElement);
        this.render();
    }

    private render(): void {
        requestAnimationFrame(() => this.render());
        for (const object of this.originalObjects.children) {
            this.camera.preventIntersection(object);
        }
        this.camera.update(this.clock.getDelta());
        this.rendererOriginal.render(this.originalScene, this.camera as THREE.PerspectiveCamera);
        this.rendererModified.render(this.modifiedScene, this.camera as THREE.PerspectiveCamera);
    }
}
