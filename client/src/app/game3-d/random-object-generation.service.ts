import { Injectable } from "@angular/core";
import * as THREE from "three";
import { Constant, Index, MaterialColor, Size} from "./Enum";
import { IPosition } from "./IPosition";

@Injectable({
  providedIn: "root",
})
export class RandomObjectGenerationService {
  private readonly WIDTH: number = 50;
  private readonly HEIGHT: number = 50;
  private readonly DEPTH: number = 50;

  private COLOR: MaterialColor[];

  private positions: IPosition[];

  public constructor() {
    this.COLOR = [MaterialColor.Red, MaterialColor.Pink, MaterialColor.Purple, MaterialColor.DeepPurple,
                  MaterialColor.Indigo, MaterialColor.Blue, MaterialColor.LightBlue, MaterialColor.Cyan, MaterialColor.Teal,
                  MaterialColor.Green, MaterialColor.LightGreen, MaterialColor.Lime, MaterialColor.Yellow, MaterialColor.Amber,
                  MaterialColor.Orange, MaterialColor.Brown, MaterialColor.Grey, MaterialColor.BlueGrey];
    this.positions = [];
    this.positions.push({x: 0, y: 0, z: 0});
  }

  public randomObject(): THREE.Mesh {
    const object: THREE.Mesh = new THREE.Mesh();
    this.randomGeometry(object);
    this.randomMaterial(object);
    this.randomScale(object);
    this.randomPosition(object);
    this.randomRotation(object);

    return object;
  }

  public randomGeometry(object: THREE.Mesh): void {
    switch (this.randomNumber(0, Constant.NbChoice)) {
      case Index.zero: {
        object.geometry = new THREE.BoxGeometry(Size.Cube, Size.Cube, Size.Cube);
        object.geometry.name = "BoxGeometry"; break;
      }
      case Index.one: {
        object.geometry = new THREE.SphereGeometry(Size.S_radius, Size.S_widthSegments, Size.S_heightSegments);
        object.geometry.name = "SphereGeometry"; break;
      }
      case Index.two: {
        object.geometry = new THREE.ConeGeometry(Size.Co_radius, Size.Co_height, Size.Co_radialSegments);
        object.geometry.name = "ConeGeometry"; break;
      }
      case Index.three: {
        object.geometry = new THREE.CylinderGeometry(Size.Cy_radiusTop, Size.Cy_radiusBottom, Size.Cy_height, Size.Cy_radialSegments);
        object.geometry.name = "CylinderGeometry"; break;
      }
      case Index.four: {
        object.geometry = new THREE.CylinderGeometry(0, Size.Pyramide, Size.Pyramide, Size.Pyramide);
        object.geometry.name = "PyramidGeometry"; break;
      }
      default:
        object.geometry = new THREE.BoxGeometry(Size.Cube, Size.Cube, Size.Cube); object.geometry.name = "BoxGeometry"; break;
      }
  }

  public randomMaterial(object: THREE.Mesh): void {
    object.material = new THREE.MeshStandardMaterial({color: this.COLOR[this.randomNumber(0, this.COLOR.length - 1)]});
  }

  public randomScale(object: THREE.Mesh): void {
    const minScale: number = 0.5;
    const maxScale: number = 1.5;
    const sizeMult: number = (Math.random() * (maxScale - minScale) + minScale);
    object.scale.x = sizeMult;
    object.scale.y = sizeMult;
    object.scale.z = sizeMult;
  }

  public randomPosition(object: THREE.Mesh): void {
    do {
      object.position.x = this.randomNumber(-this.WIDTH, this.WIDTH);
      object.position.y = this.randomNumber(-this.HEIGHT, this.HEIGHT);
      object.position.z = this.randomNumber(-this.DEPTH, this.DEPTH);
    } while (!this.validatePosition(object));
    this.positions.push({x: object.position.x, y: object.position.y, z: object.position.z});
  }

  private validatePosition(object: THREE.Mesh): boolean {
    const tolerance: number = 20;
    for (const position of this.positions) {
      const isValidX: boolean = (Math.abs(position.x - object.position.x) > tolerance);
      const isValidY: boolean = (Math.abs(position.y - object.position.y) > tolerance);
      const isValidZ: boolean = (Math.abs(position.z - object.position.z) > tolerance);
      const isValid: boolean = isValidX && isValidY && isValidZ;
      if (isValid) {
        return true;
      }
    }

    return false;
  }

  public randomRotation(object: THREE.Mesh): void {
    const MULTIPLIER: number = 2;
    object.quaternion.x = (Math.random() * MULTIPLIER) - 1;
    object.quaternion.y = (Math.random() * MULTIPLIER) - 1;
    object.quaternion.z = (Math.random() * MULTIPLIER) - 1;
    object.quaternion.w = (Math.random() * MULTIPLIER) - 1;
    object.quaternion.normalize();
  }

  public randomNumber(min: number, max: number): number {
    if (min > max) {
      throw new Error("Invalid range");
    }

    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
