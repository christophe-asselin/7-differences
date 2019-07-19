import { Injectable } from "@angular/core";
import * as THREE from "three";
import { Game3DType } from "../../../../common/Game3DType";
import { ModifType } from "./Enum";
import { Game3D } from "./Game3D";
import { RandomObjectGenerationService } from "./random-object-generation.service";
import { ScenePreviewGenerationService } from "./scene-preview-generation.service";

@Injectable({
  providedIn: "root",
})
export class Game3DGenerationService {
  private readonly NB_MODIFICATIONS: number = 7;

  private originalObjects: THREE.Mesh[];
  private modifiedObjects: THREE.Mesh[];
  private modificationTypes: boolean[];
  private objectQty: number;

  public constructor(private randomObjectGenerationService: RandomObjectGenerationService,
                     private scenePreviewGenerationService: ScenePreviewGenerationService) {
    this.originalObjects = [];
    this.modifiedObjects = [];
    this.modificationTypes = [false, false, false, false];
    this.objectQty = 0;
  }

  public async generateGame3D(name: string, objectQty: string, modifType: boolean[]): Promise<Game3D> {
    return new Promise(async (resolve: (value: Game3D) => void) => {
      this.originalObjects = [];
      this.modifiedObjects = [];
      this.objectQty = +objectQty;
      this.modificationTypes = modifType;
      this.createOriginalObjects();
      this.generateModifiedObjects();

      const newGame3D: Game3D = new Game3D(name, Game3DType.GEOMETRIC, this.originalObjects, this.modifiedObjects);
      const url: string = await this.scenePreviewGenerationService.getImageOriginalURL(Game3DType.GEOMETRIC, this.originalObjects);
      newGame3D.originalImageURL = url;

      resolve(newGame3D);
    });
  }

  private createOriginalObjects(): void {
    for (let i: number = 0; i < this.objectQty; i++) {
      const object: THREE.Mesh = this.randomObjectGenerationService.randomObject();
      object.userData.index = i;
      this.originalObjects.push(object);
    }
  }

  private generateModifiedObjects(): void {
    const numberOfEachDifference: number[] = this.generateQtyEachDifference();
    this.deleteObjects(numberOfEachDifference[ModifType.deleteObject]);
    this.recolorObjects(numberOfEachDifference[ModifType.color]);
    this.addObjects(numberOfEachDifference[ModifType.addObject]);
  }

  public generateQtyEachDifference(): number[] {
    let numberOfGeneratedDifference: number = 0;
    const numberEachDifference: number[] = [0, 0, 0, 0];
    while ( numberOfGeneratedDifference < this.NB_MODIFICATIONS) {
      switch (this.randomObjectGenerationService.randomNumber(0, this.modificationTypes.length - 1)) {
        case ModifType.addObject:
          if (this.modificationTypes[ModifType.addObject]) {
            ++numberEachDifference[ModifType.addObject];
            ++numberOfGeneratedDifference;
          }
          break;
        case ModifType.deleteObject:
          if (this.modificationTypes[ModifType.deleteObject]) {
            ++numberEachDifference[ModifType.deleteObject];
            ++numberOfGeneratedDifference;
          }
          break;
        case ModifType.color:
          if (this.modificationTypes[ModifType.color]) {
            ++numberEachDifference[ModifType.color];
            ++numberOfGeneratedDifference;
          }
          break;
        default: break;
      }
    }

    return numberEachDifference;
  }

  private recolorObjects(nb: number): void {
    for (let i: number = 0; i < nb; i++) {
      const index: number = this.generateValidIndex();
      const object: THREE.Mesh = this.cloneMesh(this.originalObjects[index] as THREE.Mesh);

      let isSameColor: boolean;
      do {
        this.randomObjectGenerationService.randomMaterial(object);
        isSameColor = (object.material as THREE.MeshStandardMaterial).color.getHexString() ===
                      (this.originalObjects[index].material as THREE.MeshStandardMaterial).color.getHexString();
      } while (isSameColor);

      this.modifiedObjects.push(object);
    }
  }

  private addObjects(nb: number): void {
    for (let i: number = 0; i < nb; ++i) {
      const addedObject: THREE.Mesh = this.randomObjectGenerationService.randomObject();
      addedObject.userData.index = this.originalObjects.length;
      this.modifiedObjects.push(addedObject);
      const transparentObject: THREE.Mesh = this.cloneMesh(addedObject);
      (transparentObject.material as THREE.Material).transparent = true;
      (transparentObject.material as THREE.Material).opacity = 0;
      this.originalObjects.push(transparentObject);
    }
  }

  private deleteObjects(nb: number): void {
    for (let i: number = 0; i < nb; ++i) {
      const randomIndex: number = this.generateValidIndex();
      const object: THREE.Mesh = this.cloneMesh(this.originalObjects[randomIndex] as THREE.Mesh);
      (object.material as THREE.Material).transparent = true;
      (object.material as THREE.Material).opacity = 0;
      this.modifiedObjects.push(object);
    }
  }

  private generateValidIndex(): number {
    let randomIndex: number;
    let indexIsValid: boolean;
    do {
      randomIndex = this.randomObjectGenerationService.randomNumber(0, this.originalObjects.length - 1);
      indexIsValid = this.modifiedObjects.every((object) => object.userData.index !== randomIndex);
    } while (!indexIsValid);

    return randomIndex;
  }

  private cloneMesh(mesh: THREE.Mesh): THREE.Mesh {
    const clone: THREE.Mesh = (mesh as THREE.Mesh).clone();
    clone.quaternion.copy(mesh.quaternion);
    clone.material = (mesh.material as THREE.MeshStandardMaterial).clone();
    clone.geometry = mesh.geometry.clone();

    return clone;
  }
}
