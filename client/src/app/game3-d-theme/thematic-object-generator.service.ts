import { Injectable } from "@angular/core";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Index } from "../game3-d/Enum";
import { Object3DConversionService } from "../game3-d/object3-dconversion.service";
import { ObjectSize, Path } from "./Enum";

@Injectable({
    providedIn: "root",
})

export class ThematicObjectGeneratorService {

    private readonly SCENE_X_MAX: number = 200;
    private readonly SCENE_Y_MAX: number = 200;
    private readonly SCENE_Z_MAX: number = 200;

    private positions: number[][];
    private index: number[];

    private readonly PI: number = 3.14;

    public constructor() {
        this.positions = [];
        this.index = [];
    }

    public getIndexDiff(): number[] {
       return this.index;
    }

    private addObject(objects: IObject3DTheme[], path: string, position: number[], scale: number[], rotation: number[], save: boolean):
     void {
        objects.push(Object3DConversionService.generateObject3DTheme(path, position, scale, rotation, objects.length));
        if (save) { this.index.push(objects.length - 1); }
    }

    private randNumber(min: number, max: number): number {
        return (Math.random() * (max - min + 1) + min);
    }

    private validatePosition(position: number[], tolerance: number): boolean {
        for (const carPosition of this.positions) {
          const isSameX: boolean = (Math.abs(position[0] - carPosition[0]) < tolerance);
          const isSameY: boolean = (Math.abs(position[1] - carPosition[1]) < tolerance);
          const isSameZ: boolean = (Math.abs(position[Index.two] - carPosition[Index.two]) < tolerance);
          const isSamePosition: boolean = isSameX && isSameY && isSameZ;
          if (isSamePosition) {
            return true;
          }
        }

        return false;
    }

    public generateRoadX(objects: IObject3DTheme[], quantity: number): number {
        const MIN_X: number = 30;
        const ROAD_LENGHT: number = 12;
        const POSITION_Z: number = 0.6;
        const roadX: number = this.randNumber(MIN_X, this.SCENE_X_MAX - ((quantity * ROAD_LENGHT) / Index.two));
        const scale: number[] = [ObjectSize.Road, ObjectSize.Road, ObjectSize.Road];
        for (let i: number = 0; i < quantity; i++) {
            const direction: number = i * ROAD_LENGHT;
            const position: number[] = [roadX, POSITION_Z, direction];
            this.addObject(objects, Path.Road, position, scale, [0, 0, 0], true);
        }

        return roadX;
    }

    public generateRoadY(objects: IObject3DTheme[], quantity: number): number {
        const MIN_X: number = 30;
        const ROAD_LENGHT: number = 12;
        const ROAD_WIDTH: number = 8;
        const POSITION_Z: number = 0.6;
        const roadX: number = this.randNumber(MIN_X, this.SCENE_X_MAX - ((quantity * ROAD_LENGHT) / Index.two));
        const roadY: number = this.randNumber(0, (quantity * ROAD_LENGHT) / Index.two);
        const rotation: number = 0.5;
        const scale: number[] = [ObjectSize.Road, ObjectSize.Road, ObjectSize.Road];

        for (let i: number = 0; i < quantity; i++) {
            const direction: number = i * ROAD_LENGHT + ROAD_WIDTH;
            const position: number[] = [roadX + direction, POSITION_Z, roadY];
            this.addObject(objects, Path.Road, position, scale, [0, rotation * this.PI, 0], true);
        }

        return roadY;
    }

    public generateCarX(objects: IObject3DTheme[], quantity: number, roadX: number, roadY: number, nbRoad: number): void {
        const carX: number = roadX;
        let position: number = 0;
        const POSITION_Z: number = 0.8;
        const ROAD_LENGHT: number = 12;
        const scale: number[] = [ObjectSize.Car, ObjectSize.Car, ObjectSize.Car];
        const tolerance: number = 8;
        for (let i: number = 0; i < quantity; i++) {
            const choice: number = Math.floor(this.randNumber(0, 1));
            const newCarX: number = choice ? carX - 1 : carX + 1;
            let iterations: number = 0;
            const MAX_ITERATIONS: number = 1000;
            do {
                position = this.randNumber(0, (nbRoad * ROAD_LENGHT) / Index.two);
                iterations++;
                if (iterations > MAX_ITERATIONS) { break; }
            } while (this.validatePosition([newCarX, POSITION_Z, position], tolerance));
            this.addObject(objects, Path.Car2, [newCarX, POSITION_Z, position], scale, [0, (choice ? 0 : this.PI), 0], true);
            this.positions.push([newCarX, POSITION_Z, position]);
        }
    }

    public generateCarY(objects: IObject3DTheme[], quantity: number, roadX: number, roadY: number, nbRoad: number): void {
        let position: number = 0;
        const POSITION_Z: number = 0.8;
        const ROAD_LENGHT: number = 12;
        const scale: number[] = [ObjectSize.Car, ObjectSize.Car, ObjectSize.Car];
        const tolerance: number = 8;
        const carY: number = roadY;
        const ANGLE1: number = 0.5; const ANGLE2: number = 1.5;
        for (let i: number = 0; i < quantity; i++) {
            const choice: number = Math.floor(this.randNumber(0, 1));
            const newCarY: number = choice ? carY + 1 : carY - 1;
            let iterations: number = 0;
            const MAX_ITERATIONS: number = 1000;
            do {
                position = this.randNumber(0, (nbRoad * ROAD_LENGHT) / Index.two);
                iterations++;
                if (iterations > MAX_ITERATIONS) { break; }
            } while (this.validatePosition([roadX + position, POSITION_Z, newCarY], tolerance));
            const rotation: number[] = [0, (choice ? ANGLE1 * this.PI : ANGLE2 * this.PI), 0];
            this.addObject(objects, Path.Car, [roadX + position, POSITION_Z, newCarY], scale, rotation, true);
            this.positions.push([roadX + position, POSITION_Z, newCarY]);
        }
    }

    public generateBusX(objects: IObject3DTheme[], quantity: number, roadX: number, nbRoad: number): void {
        const busX: number = roadX;
        let position: number = 0;
        const POSITION_Z: number = 0.8;
        const ROAD_LENGHT: number = 12;
        const scale: number[] = [ObjectSize.Bus, ObjectSize.Bus, ObjectSize.Bus];
        const tolerance: number = 8;
        for (let i: number = 0; i < quantity; i++) {
            const choice: number = Math.floor(this.randNumber(0, 1));
            const newBusX: number = choice ? busX - 1 : busX + 1;
            let iterations: number = 0;
            const MAX_ITERATIONS: number = 1000;
            do {
                position = this.randNumber(0, (nbRoad * ROAD_LENGHT) / Index.two);
                iterations++;
                if (iterations > MAX_ITERATIONS) { break; }
            } while (this.validatePosition([newBusX, POSITION_Z, position], tolerance));
            this.addObject(objects, Path.Bus2, [newBusX, POSITION_Z, position], scale, [0, 0, 0], true);
            this.positions.push([newBusX, POSITION_Z, position]);
        }
    }

    public generateBusY(objects: IObject3DTheme[], quantity: number, roadX: number, roadY: number, nbRoad: number): void {
        let position: number = 0;
        const POSITION_Z: number = 0.8;
        const ROAD_LENGHT: number = 12;
        const scale: number[] = [ObjectSize.Bus, ObjectSize.Bus, ObjectSize.Bus];
        const tolerance: number = 8;
        const busY: number = roadY; position = 0;
        const ANGLE1: number = 0.5; const ANGLE2: number = 1.5;
        for (let i: number = 0; i < quantity; i++) {
            const choice: number = Math.floor(this.randNumber(0, 1));
            const newBusY: number = choice ? busY + 1 : busY - 1;
            let iterations: number = 0;
            const MAX_ITERATIONS: number = 1000;
            do {
                position = this.randNumber(0, (nbRoad * ROAD_LENGHT) / Index.two);
                iterations++;
                if (iterations > MAX_ITERATIONS) { break; }
            } while (this.validatePosition([roadX + position, POSITION_Z, newBusY], tolerance));
            const rotation: number[] = [0, (choice ? ANGLE1 * this.PI : ANGLE2 * this.PI), 0];
            this.addObject(objects, Path.Bus, [roadX + position, POSITION_Z, newBusY], scale, rotation, true);
            this.positions.push([roadX + position, POSITION_Z, newBusY]);
        }
    }

    public generateRail(objects: IObject3DTheme[], quantity: number, roadX: number): number[] {
        const X_MAX: number = 30;
        const RAIL_LENGHT: number = 9;
        const POSITION_Z: number = 0.5;
        const railX: number = this.randNumber(0, roadX - X_MAX);
        for (let i: number = 0; i < quantity; i++) {
            const scale: number[] = [ObjectSize.Rail, ObjectSize.Rail, ObjectSize.Rail];
            const direction: number = i * RAIL_LENGHT;
            this.addObject(objects, Path.Rail, [railX, POSITION_Z, direction], scale, [0, 0, 0], false);
        }
        const coordinates: number[] = [];
        coordinates.push(railX);
        coordinates.push(0);

        return coordinates;
    }

    public generateTrain(objects: IObject3DTheme[], quantity: number, railX: number, railY: number, nbRail: number): void {
        const RAIL_LENGHT: number = 9;
        const trainX: number = railX;
        const POSITION_Z: number = 0.6;
        const ANGLE: number = 0.5;
        let trainY: number = 0;
        for (let i: number = 0; i < quantity; i++) {
            const tolerance: number = 25;
            let iterations: number = 0;
            const MAX_ITERATIONS: number = 1000;
            do {
                trainY = this.randNumber(railY, railY + nbRail * RAIL_LENGHT);
                iterations++;
                if (iterations > MAX_ITERATIONS) { break; }
            } while (this.validatePosition([trainX, POSITION_Z, trainY], tolerance));
            const scale: number[] = [ObjectSize.Train, ObjectSize.Train, ObjectSize.Train];
            this.addObject(objects, Path.Train, [trainX, POSITION_Z, trainY], scale, [0, ANGLE * this.PI, 0], false);

            this.positions.push([trainX, POSITION_Z, trainY]);
        }
    }

    public generateBuilding1(objects: IObject3DTheme[], quantity: number, roadX: number): void {
        const buildingX: number = roadX;
        const BUILDING_LENGHT: number = 8;
        const POSITION_Z: number = 0.5;
        const DIRECTION: number = 10;
        const scale: number[] = [ObjectSize.Building, ObjectSize.Building, ObjectSize.Building];
        const pathBuilding: string[] = [Path.Skyscraper, Path.Skyscraper2, Path.Skyscraper3];
        for (let i: number = 0; i < quantity; i++) {
            const choice: number = Math.floor(this.randNumber(0, Index.two));
            const position: number[] = [buildingX - BUILDING_LENGHT, POSITION_Z, i * DIRECTION];
            this.addObject(objects, pathBuilding[choice], position, scale, [0, 0, 0], true);
        }
    }

    public generateBuilding2(objects: IObject3DTheme[], quantity: number, roadX: number, roadY: number): void {
        const buildingX: number = roadX;
        const buildingY: number = roadY;
        const BUILDING_LENGHT: number = 8;
        const POSITION_Z: number = 0.5;
        const DIRECTION: number = 10;
        const pathBuilding: string[] = [Path.Skyscraper, Path.Skyscraper2, Path.Skyscraper3];
        const scale: number[] = [ObjectSize.Building, ObjectSize.Building, ObjectSize.Building];
        for (let i: number = 0; i < quantity; i++) {
            const choice: number = Math.floor(this.randNumber(0, Index.two));
            const position: number[] = [buildingX + i * DIRECTION + BUILDING_LENGHT, POSITION_Z, buildingY - BUILDING_LENGHT];
            this.addObject(objects, pathBuilding[choice], position, scale, [0, 0, 0], true);
        }
    }

    public generateBuilding3(objects: IObject3DTheme[], quantity: number, roadX: number, roadY: number): void {
        const buildingX: number = roadX;
        const buildingY: number = roadY;
        const BUILDING_LENGHT: number = 8;
        const POSITION_Z: number = 0.5;
        const DIRECTION: number = 10;
        const scale: number[] = [ObjectSize.Building, ObjectSize.Building, ObjectSize.Building];
        const pathBuilding: string[] = [Path.Skyscraper, Path.Skyscraper2, Path.Skyscraper3];
        for (let i: number = 0; i < quantity; i++) {
            const choice: number = Math.floor(this.randNumber(0, Index.two));
            const position: number[] = [buildingX + i * DIRECTION + BUILDING_LENGHT, POSITION_Z, buildingY + BUILDING_LENGHT];
            this.addObject(objects, pathBuilding[choice], position, scale, [0, 0, 0], true);
        }
    }

    public generateAirplane(objects: IObject3DTheme[], quantity: number): void {
        const scale: number[] = [ObjectSize.Airplane, ObjectSize.Airplane, ObjectSize.Airplane];
        const Z_MIN: number = 75;
        for (let i: number = 0; i < quantity; i++) {
            const airplaneX: number = this.randNumber(0, this.SCENE_X_MAX);
            const airplaneY: number = this.randNumber(0, this.SCENE_Y_MAX);
            const airplaneZ: number = this.randNumber(Z_MIN, this.SCENE_Z_MAX);
            this.addObject(objects, Path.Airplane, [airplaneX, airplaneZ, airplaneY], scale, [0, 0, 0], false);
        }
    }

    public generateTree1(objects: IObject3DTheme[], quantity: number, roadX: number, roadY: number): void {
        const scale: number[] = [ObjectSize.Tree, ObjectSize.Tree, ObjectSize.Tree];
        const MIN: number = 20;
        const POSITION_Z: number = 0.5;
        for (let i: number = 0; i < quantity; i++) {
            const treeX: number = this.randNumber(roadX + MIN, this.SCENE_X_MAX);
            const treeY: number = this.randNumber(roadY + MIN, this.SCENE_Y_MAX);
            this.addObject(objects, Path.Tree, [treeX, POSITION_Z, treeY], scale, [0, 0, 0], true);
        }
    }

    public generateTree2(objects: IObject3DTheme[], quantity: number, roadX: number, roadY: number): void {
        const scale: number[] = [ObjectSize.Tree, ObjectSize.Tree, ObjectSize.Tree];
        const MIN: number = 20;
        const POSITION_Z: number = 0.5;
        for (let i: number = 0; i < quantity; i++) {
            const treeX: number = this.randNumber(roadX + MIN, this.SCENE_X_MAX);
            const treeY: number = this.randNumber(0, roadY - MIN);
            this.addObject(objects, Path.Tree2, [treeX, POSITION_Z, treeY], scale, [0, 0, 0], true);
        }
    }
}
