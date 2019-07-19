import * as THREE from "three";
import { IObject3D } from "../../../../common/IObject3D";

export class ObjectComparator {

  public areEqual (object1: IObject3D, object2: IObject3D): boolean {
    return this.haveSameColor(object1, object2)        &&
           this.haveSameTransparency(object1, object2) &&
           this.haveSameGeneralTraits(object1, object2);
  }

  public areEqualMesh (object1: THREE.Mesh, object2: THREE.Mesh): boolean {
    return this.haveSameColorMesh(object1, object2)        &&
           this.haveSameTransparencyMesh(object1, object2) &&
           this.haveSameGeneralTraitsMesh(object1, object2);
  }

  public haveSameTransparency (object1: IObject3D, object2: IObject3D): boolean {
    return object1.transparent === object2.transparent;
  }

  public haveSameTransparencyMesh (object1: THREE.Mesh, object2: THREE.Mesh): boolean {
    return (object1.material as THREE.Material).transparent ===
           (object2.material as THREE.Material).transparent;
  }

  public haveSameColor (object1: IObject3D, object2: IObject3D): boolean {
    return object1.color === object2.color;
  }

  public haveSameColorMesh (object1: THREE.Mesh, object2: THREE.Mesh): boolean {
    return (object1.material as THREE.MeshStandardMaterial).color.getHexString() ===
           (object2.material as THREE.MeshStandardMaterial).color.getHexString();
  }

  public haveSameGeneralTraits (object1: IObject3D, object2: IObject3D): boolean {
    const NUMBER_ITERATIONS: number = 3;

    let i: number;
    for (i = 0; i < NUMBER_ITERATIONS; ++i) {
      if (object1.scale[i]    !== object2.scale[i]    ||
          object1.position[i] !== object2.position[i] ||
          object1.rotation[i] !== object2.rotation[i]) {
              return false;
      }
    }
    if (object1.rotation[i] !== object2.rotation[i]) {
      return false;
    }

    return object1.type  === object2.type  &&
           object1.index === object2.index;
  }

  public haveSameGeneralTraitsMesh (object1: THREE.Mesh, object2: THREE.Mesh): boolean {
    return object1.scale.equals(object2.scale)              &&
           object1.position.equals(object2.position)        &&
           object1.quaternion.equals(object2.quaternion)    &&
           object1.geometry.type ===  object2.geometry.type &&
           object1.userData.index ===  object2.userData.index;
  }
}
