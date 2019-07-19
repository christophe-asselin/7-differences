import { Injectable } from "@angular/core";
import * as THREE from "three";
import { IObject3D } from "../../../../common/IObject3D";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Index, Size } from "./Enum";

@Injectable({
    providedIn: "root",
})
export class Object3DConversionService {

    public static generateObject3D(object: THREE.Mesh): IObject3D {
        return {
            color: (object.material as THREE.MeshStandardMaterial).color.getHexString(),
            position: [object.position.x, object.position.y, object.position.z],
            rotation: [object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w],
            scale: [object.scale.x, object.scale.y, object.scale.z],
            type: object.geometry.name,
            transparent: (object.material as THREE.Material).transparent,
            index: object.userData.index,
        };
    }

    public static generateObject3DTheme(path: string, position: number[], scale: number[], rotation: number[], index: number):
    IObject3DTheme {
        return {
            path: path,
            position: position,
            scale: scale,
            rotation: rotation,
            transparent: false,
            index: index,
        };
    }

    public generateThreeObject(object: IObject3D): THREE.Mesh {
        let threeObject: THREE.Mesh = new THREE.Mesh();
        switch (object.type) {
            case "BoxGeometry":
                threeObject.geometry = new THREE.BoxGeometry(Size.Cube, Size.Cube, Size.Cube); break;
            case "SphereGeometry":
                threeObject.geometry = new THREE.SphereGeometry(Size.S_radius, Size.S_widthSegments, Size.S_heightSegments); break;
            case "ConeGeometry":
                threeObject.geometry = new THREE.ConeGeometry(Size.Co_radius, Size.Co_height, Size.Co_radialSegments); break;
            case "CylinderGeometry":
                threeObject.geometry =
                    new THREE.CylinderGeometry(Size.Cy_radiusTop, Size.Cy_radiusBottom, Size.Cy_height, Size.Cy_radialSegments);
                break;
            case "PyramidGeometry":
                threeObject.geometry = new THREE.CylinderGeometry(0, Size.Pyramide, Size.Pyramide, Size.Pyramide); break;
            default:
                threeObject = new THREE.Mesh(); break;
        }
        threeObject.material = new THREE.MeshStandardMaterial({ color: parseInt(object.color, 16) });
        threeObject.position.set(object.position[Index.zero], object.position[Index.one], object.position[Index.two]);
        threeObject.quaternion.set(object.rotation[Index.zero], object.rotation[Index.one],
                                   object.rotation[Index.two], object.rotation[Index.three]);
        threeObject.scale.set(object.scale[Index.zero], object.scale[Index.one], object.scale[Index.two]);
        threeObject.material.transparent = object.transparent;
        threeObject.material.opacity = 0;
        threeObject.geometry.name = object.type;
        threeObject.userData.index = object.index;

        return threeObject;
    }
}
