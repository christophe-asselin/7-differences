import { Injectable } from "@angular/core";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Index, ModifType } from "../game3-d/Enum";
import { ObjectSize, Path } from "./Enum";

@Injectable({
    providedIn: "root",
})
export class DifferenceThematicGeneratorService {
    private readonly NB_MODIFICATIONS: number = 7;

    private modificationTypes: boolean[];
    private originalObjects: IObject3DTheme[];
    private modifiedObjects: IObject3DTheme[];
    private index: number[];

    public constructor() {
        this.modifiedObjects = [];
        this.originalObjects = [];
        this.index = [];
        this.modificationTypes = [false, false, false, false];
     }

    public initialize(modifType: boolean[], originalObjects: IObject3DTheme[], index: number[]): void {
        this.modifiedObjects = [];
        this.modificationTypes = modifType;
        this.originalObjects = originalObjects;
        this.index = index;
    }

    public getOriginalObjects(): IObject3DTheme[] {
        return this.originalObjects;
    }

    public getModifiedObjects(): IObject3DTheme[] {
        return this.modifiedObjects;
    }

    public generateDifference(roadX: number, roadY: number, nbRoad: number, railX: number, railY: number): IObject3DTheme[] {
        const difference: number[] = this.generateQtyEachDifference();
        this.generateAddDiff(difference[ModifType.addObject], roadX, roadY, nbRoad, railX, railY);
        this.generateDeleteDiff(difference[ModifType.deleteObject]);
        this.generateTextureDiff(difference[ModifType.texture]);

        return this.modifiedObjects;
    }

    private generateQtyEachDifference(): number[] {
        let numberOfGeneratedDifference: number = 0;
        const numberEachDifference: number[] = [0, 0, 0, 0];
        while ( numberOfGeneratedDifference < this.NB_MODIFICATIONS) {
          switch (Math.floor(this.randNumber(0, this.modificationTypes.length - 1))) {
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
            case ModifType.texture:
              if (this.modificationTypes[ModifType.texture]) {
                ++numberEachDifference[ModifType.texture];
                ++numberOfGeneratedDifference;
              }
              break;
            default: break;
          }
        }

        return numberEachDifference;
      }

    private generateCar(addObjects: IObject3DTheme[], carX: number, carZ: number, carY: number): void {
        addObjects.push({
            path: Path.Car, position: [carX, carZ, carY],
            scale: [ObjectSize.Car, ObjectSize.Car, ObjectSize.Car],
            rotation: [0, 0, 0], transparent: false, index: this.addObjects.length,
        });
    }

    private generateBus(addObjects: IObject3DTheme[], busX: number, busZ: number, busY: number): void {
        addObjects.push({
            path: Path.Bus, position: [busX, busZ, busY],
            scale: [ObjectSize.Bus, ObjectSize.Bus, ObjectSize.Bus],
            rotation: [0, 0, 0], transparent: false, index: this.addObjects.length,
        });
    }

    private generateBuilding1(addObjects: IObject3DTheme[], buildingX: number, buildingZ: number, buildingY: number): void {
        addObjects.push({
            path: Path.Skyscraper, position: [buildingX, buildingZ, buildingY],
            scale: [ObjectSize.Building, ObjectSize.Building, ObjectSize.Building],
            rotation: [0, 0, 0], transparent: false, index: this.addObjects.length,
        });
    }

    private generateBuilding2(addObjects: IObject3DTheme[], buildingX: number, buildingZ: number, buildingY: number): void {
        addObjects.push({
            path: Path.Skyscraper2, position: [buildingX, buildingZ, buildingY],
            scale: [ObjectSize.Building, ObjectSize.Building, ObjectSize.Building],
            rotation: [0, 0, 0], transparent: false, index: this.addObjects.length,
        });
    }

    private generatePlane(addObjects: IObject3DTheme[], planeX: number, planeZ: number, planeY: number): void {
        addObjects.push({
            path: Path.Airplane, position: [planeX, planeZ, planeY],
            scale: [ObjectSize.Airplane, ObjectSize.Airplane, ObjectSize.Airplane],
            rotation: [0, 0, 0], transparent: false, index: this.addObjects.length,
        });
    }

    private generateTree(addObjects: IObject3DTheme[], treeX: number, treeZ: number, treeY: number): void {
        addObjects.push({
            path: Path.Tree, position: [treeX, treeZ, treeY],
            scale: [ObjectSize.Tree, ObjectSize.Tree, ObjectSize.Tree],
            rotation: [0, 0, 0], transparent: false, index: this.addObjects.length,
        });
    }

    private generateAddDiff(quantity: number, roadX: number, roadY: number, nbRoad: number, railX: number, railY: number): void {
        const addObjects: IObject3DTheme[] = [];
        const BUILDING_LENGHT: number = 8;
        for (let i: number = 0; i < quantity; i++) {
            const NB_ELEMENT: number = 5; const MAX_SCENE: number = 200; const SCENE_FLOOR: number = 0.8; const DIRECTION: number = 10;
            const choice: number = Math.floor(this.randNumber(0, NB_ELEMENT));
            switch (choice) {
                case 0:
                    this.generateCar(addObjects, roadX, SCENE_FLOOR, DIRECTION * i); break;
                case 1:
                    this.generateBus(addObjects, roadX, SCENE_FLOOR, DIRECTION * i); break;
                case Index.two:
                    this.generateBuilding1(addObjects, roadX - BUILDING_LENGHT * Index.two, SCENE_FLOOR, DIRECTION * i); break;
                case Index.three:
                    this.generateBuilding2(addObjects, roadX - BUILDING_LENGHT * Index.two, SCENE_FLOOR, DIRECTION * i); break;
                case Index.four:
                    const MIN_Z: number = 100;
                    const AIRPLANE_Z: number = this.randNumber(MIN_Z, MAX_SCENE);
                    this.generatePlane(addObjects, this.randNumber(0, MAX_SCENE), AIRPLANE_Z, this.randNumber(0, MAX_SCENE)); break;
                case Index.five:
                    const RAND_X: number = this.randNumber(roadX, MAX_SCENE);
                    const RAND_Y: number = this.randNumber(0, MAX_SCENE);
                    this.generateTree(addObjects, RAND_X, SCENE_FLOOR, RAND_Y); break;
                default: break;
            }
        }
        this.addObjects(addObjects);
    }

    private addObjects(addObjects: IObject3DTheme[]): void {
        for (const object of addObjects) {
            object.transparent = true;
            object.index = this.originalObjects.length;
            this.originalObjects.push(object);

            const objectAdd: IObject3DTheme = this.getObject(object.index);
            objectAdd.transparent = false;
            this.modifiedObjects.push(objectAdd);
        }
    }

    private generateDeleteDiff(quantity: number): void {
        for (let i: number = 0; i < quantity; i++) {
            const index: number = this.generateValidIndexDelete();
            const deleteObject: IObject3DTheme = this.getObject(index);
            deleteObject.transparent = true;
            this.modifiedObjects.push(deleteObject);
        }
    }

    private generateTextureDiff(quantity: number): void {
        for (let i: number = 0; i < quantity; i++) {
            const index: number = this.generateValidIndexDiffTexture();
            const objectModify: IObject3DTheme = this.getObject(index);
            const objectPath: string = objectModify.path;

            switch (objectPath) {
                case Path.Road: objectModify.path = Path.Road3; break;
                case Path.Car: objectModify.path = Path.Car2; break;
                case Path.Car2: objectModify.path = Path.Car; break;
                case Path.Bus: objectModify.path = Path.Bus2; break;
                case Path.Bus2: objectModify.path = Path.Bus; break;
                case Path.Skyscraper: objectModify.path = Path.Skyscraper2; break;
                case Path.Skyscraper2: objectModify.path = Path.Skyscraper3; break;
                case Path.Skyscraper3: objectModify.path = Path.Skyscraper; break;
                case Path.Tree: objectModify.path = Path.Tree2; break;
                case Path.Tree2: objectModify.path = Path.Tree; break;
                default: break;
            }
            this.modifiedObjects.push(objectModify);
        }
    }

    private generateValidIndexDelete(): number {
        let randomIndex: number;
        let indexIsValid: boolean;
        let isTrain: boolean;
        do {
            randomIndex = Math.floor(this.randNumber(0, this.originalObjects.length - 1));
            isTrain = this.getObject(randomIndex).path === Path.Train;
            indexIsValid = this.modifiedObjects.every((object) => object.index !== randomIndex);
        } while (!indexIsValid && !isTrain);

        return randomIndex;
    }

    private generateValidIndexDiffTexture(): number {
        let randomValue: number;
        let randomIndex: number;

        let indexIsValid: boolean;
        do {
            randomValue = Math.floor(this.randNumber(0, this.index.length - 1));
            randomIndex = this.index[randomValue];
            indexIsValid = this.modifiedObjects.every((object) => object.index !== randomIndex);
        } while (!indexIsValid);

        return randomIndex;
    }

    private randNumber(min: number, max: number): number {
        return (Math.random() * (max - min + 1) + min);
    }

    private getObject(index: number): IObject3DTheme {
        const originalObject: IObject3DTheme =
        this.originalObjects.find((object: IObject3DTheme) => object.index === +index) as IObject3DTheme;

        return {...originalObject};
    }

}
