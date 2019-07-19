import { Injectable } from "@angular/core";
import * as THREE from "three";
import { Game3DType } from "../../../../common/Game3DType";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Color, ConstCamera } from "./Enum";
import { ICameraParams } from "./ICameraParams";
import { MovingCamera } from "./MovingCamera";
import { RenderService } from "./render.service";

@Injectable({
  providedIn: "root",
})
export class ScenePreviewGenerationService {

  public constructor (private renderService: RenderService) { }

  public async getImageOriginalURL(game3DType: Game3DType, originalObjects: IObject3DTheme[] | THREE.Mesh[]): Promise<string> {
    return new Promise(async (resolve: (value: string) => void) => {
      const camera: MovingCamera = this.generateCamera(game3DType);

      const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.domElement.hidden = true;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      document.body.appendChild(renderer.domElement);

      const scene: THREE.Scene = game3DType === Game3DType.GEOMETRIC ?
                                 this.createSceneGeometricPreview(originalObjects as THREE.Mesh[]) :
                                 await this.createSceneThematicPreview(originalObjects as IObject3DTheme[]);
      renderer.render(scene, camera as THREE.PerspectiveCamera);

      resolve(renderer.domElement.toDataURL());
    });
  }

  private createSceneGeometricPreview(originalObjects: THREE.Mesh[]): THREE.Scene {
    const scenePreview: THREE.Scene = new THREE.Scene();
    scenePreview.background = new THREE.Color(Color.SceneGeoColor);

    const light: THREE.AmbientLight = new THREE.AmbientLight();
    scenePreview.add(light);

    originalObjects.forEach((object) => scenePreview.add(object));

    return scenePreview;
  }

  private async createSceneThematicPreview(originalObjects: IObject3DTheme[]): Promise<THREE.Scene> {
    return new Promise(async (resolve: (value: THREE.Scene) => void) => {
      const scenePreview: THREE.Scene = new THREE.Scene();
      scenePreview.background = new THREE.Color(Color.SceneThemColor);

      const light: THREE.AmbientLight = new THREE.AmbientLight();
      scenePreview.add(light);

      const SCENE_X_MAX: number = 200;
      const ground: THREE.Mesh = this.renderService.generateBaseStructure(SCENE_X_MAX);
      scenePreview.add(ground);

      for (const object of originalObjects) {
        const objectLoad: THREE.Scene = await this.renderService.loadObject(object);
        scenePreview.add(objectLoad);
      }

      resolve(scenePreview);
    });
  }

  private generateCamera(game3DType: Game3DType): MovingCamera {
    const cameraParams: ICameraParams = {
      fov: ConstCamera.fieldOfView,
      aspect: window.innerWidth / window.innerHeight,
      near: ConstCamera.nearClippingPane,
      far: ConstCamera.farClippingPane,
    };
    const camera: MovingCamera = new MovingCamera(cameraParams, game3DType);
    if (game3DType === Game3DType.GEOMETRIC) {
      camera.setPosition(new THREE.Vector3(0, 0, ConstCamera.cameraZ));
    } else {
      const CAMERA_XZ: number = 100;
      const CAMERA_Y: number = 5;
      camera.setPosition(new THREE.Vector3(CAMERA_XZ, CAMERA_Y, CAMERA_XZ));
    }

    return camera;
  }

}
