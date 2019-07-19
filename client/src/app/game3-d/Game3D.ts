import { Game3DType } from "../../../../common/Game3DType";
import { IObject3D } from "../../../../common/IObject3D";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Object3DConversionService } from "./object3-dconversion.service";

export class Game3D {
    public name: string;
    public type: Game3DType;
    public originalImageURL: string;
    public originalObjects: IObject3D[] | IObject3DTheme[];
    public modifiedObjects: IObject3D[] | IObject3DTheme[];

    public constructor(name: string, type: Game3DType,
                       originalObjects: THREE.Mesh[] | IObject3DTheme[],
                       modifiedObjects: THREE.Mesh[] | IObject3DTheme[]) {
        this.name = name;
        this.type = type;
        this.originalImageURL = "";
        this.originalObjects = [];
        this.modifiedObjects = [];

        if (type === Game3DType.GEOMETRIC) {
            for (const object of originalObjects) {
                (this.originalObjects as IObject3D[]).push(Object3DConversionService.generateObject3D(object as THREE.Mesh));
            }
            for (const object of modifiedObjects) {
                (this.modifiedObjects as IObject3D[]).push(Object3DConversionService.generateObject3D(object as THREE.Mesh));
            }
        } else {
            this.originalObjects = originalObjects as IObject3DTheme[];
            this.modifiedObjects = modifiedObjects as IObject3DTheme[];
        }
    }
}
