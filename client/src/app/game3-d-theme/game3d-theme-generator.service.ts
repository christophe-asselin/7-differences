import { Injectable } from "@angular/core";
import { Game3DType } from "../../../../common/Game3DType";
import { IObject3DTheme } from "../../../../common/IObject3DTheme";
import { Index } from "../game3-d/Enum";
import { Game3D } from "../game3-d/Game3D";
import { ScenePreviewGenerationService } from "../game3-d/scene-preview-generation.service";
import { Percentage } from "./Enum";
import { DifferenceThematicGeneratorService } from "./difference-thematic-generator.service";
import { ThematicObjectGeneratorService } from "./thematic-object-generator.service";

@Injectable({
  providedIn: "root",
})

export class Game3DThemeGeneratorService {

  private originalObjects: IObject3DTheme[];
  private modifiedObjects: IObject3DTheme[];

  public constructor(private scenePreviewGenerationService: ScenePreviewGenerationService,
                     private differenceThematicGeneratorService: DifferenceThematicGeneratorService,
                     private thematicObjectGeneratorService: ThematicObjectGeneratorService) {
    this.originalObjects = [];
    this.modifiedObjects = [];
  }

  public async generateGame3D(name: string, objectQty: string, modifType: boolean[]): Promise<Game3D> {
    return new Promise(async (resolve: (value: Game3D) => void) => {
      this.generateScenes(+objectQty, modifType);
      const newGame3D: Game3D = new Game3D(name, Game3DType.THEMATIC,
                                           this.originalObjects as IObject3DTheme[], this.modifiedObjects as IObject3DTheme[]);
      const url: string = await this.scenePreviewGenerationService.getImageOriginalURL(Game3DType.THEMATIC, this.originalObjects);
      newGame3D.originalImageURL = url;

      resolve(newGame3D);
    });
  }

  private generateRoad(objectQty: number): number[] {
    const nbRoad: number = Math.floor(objectQty * Percentage.Road);
    const roadX: number = this.thematicObjectGeneratorService.generateRoadX(this.originalObjects, nbRoad);
    const roadY: number = this.thematicObjectGeneratorService.generateRoadY(this.originalObjects, nbRoad);

    return [nbRoad, roadX, roadY];
  }

  private generateCar(objectQty: number, roadX: number, roadY: number, nbRoad: number): number {
    const nbCar: number = Math.floor(objectQty * Percentage.Car);
    this.thematicObjectGeneratorService.generateCarX(this.originalObjects, nbCar, roadX, roadY, nbRoad);
    this.thematicObjectGeneratorService.generateCarY(this.originalObjects, nbCar, roadX, roadY, nbRoad);

    return nbCar;
  }

  private generateBus(objectQty: number, roadX: number, roadY: number, nbRoad: number): number {
    const nbBus: number = Math.floor(objectQty * Percentage.Bus);
    this.thematicObjectGeneratorService.generateBusX(this.originalObjects, nbBus, roadX, nbRoad);
    this.thematicObjectGeneratorService.generateBusY(this.originalObjects, nbBus, roadX, roadY, nbRoad);

    return nbBus;
  }

  private generateRail(objectQty: number, roadX: number): number[] {
    const nbRail: number = Math.floor(objectQty * Percentage.Rail);
    const result2: number[] = this.thematicObjectGeneratorService.generateRail(this.originalObjects, nbRail, roadX);

    return [nbRail, result2[0], result2[1]];
  }

  private generateBuilding(objectQty: number, roadX: number, roadY: number): number {
    const nbBuilding: number = Math.floor(objectQty * Percentage.Build);
    this.thematicObjectGeneratorService.generateBuilding1(this.originalObjects, nbBuilding, roadX);
    this.thematicObjectGeneratorService.generateBuilding2(this.originalObjects, nbBuilding, roadX, roadY);
    this.thematicObjectGeneratorService.generateBuilding3(this.originalObjects, nbBuilding, roadX, roadY);

    return nbBuilding;
  }

  private generateTree(objectQty: number, nbRoad: number, nbCar: number, nbBus: number, nbRail: number, nbTrain: number,
                       nbBuilding: number, nbAirplane: number, roadX: number, roadY: number): void {
    const nbTree: number =
    objectQty - (nbRoad * Index.two + nbCar * Index.two + nbBus * Index.two + nbRail + nbTrain + nbBuilding * Index.three + nbAirplane);
    const nbTree1: number = Math.floor(nbTree / Index.two); const nbTree2: number = nbTree - nbTree1;
    this.thematicObjectGeneratorService.generateTree1(this.originalObjects, nbTree1, roadX, roadY);
    this.thematicObjectGeneratorService.generateTree2(this.originalObjects, nbTree2, roadX, roadY);
  }

  private generateScenes(objectQty: number, modifType: boolean[]): void {
    this.originalObjects = []; this.modifiedObjects = [];
    // Road
    const result: number[] = this.generateRoad(objectQty);
    const nbRoad: number = result[0]; const roadX: number = result[1]; const roadY: number = result[Index.two];
    // Car
    const nbCar: number = this.generateCar(objectQty, roadX, roadY, nbRoad);
    // Bus
    const nbBus: number = this.generateBus(objectQty, roadX, roadY, nbRoad);
    // Rail
    const result2: number[] = this.generateRail(objectQty, roadX);
    const nbRail: number = result2[0]; const railX: number = result2[1]; const railY: number = result2[Index.two];
    // Train
    let nbTrain: number = Math.floor(objectQty * Percentage.Train);
    nbTrain = nbTrain === 0 ? 1 : nbTrain;
    this.thematicObjectGeneratorService.generateTrain(this.originalObjects, nbTrain, railX, railY, nbRail);
    // Building
    const nbBuilding: number = this.generateBuilding(objectQty, roadX, roadY);
    // Air plane
    let nbAirplane: number = Math.floor(objectQty * Percentage.Plane);
    nbAirplane = nbAirplane === 0 ? 1 : nbAirplane;
    this.thematicObjectGeneratorService.generateAirplane(this.originalObjects, nbAirplane);
    // Tree
    this.generateTree(objectQty, nbRoad, nbCar, nbBus, nbRail, nbTrain, nbBuilding, nbAirplane, roadX, roadY);
    this.generateModifiedObjects(modifType, roadX, roadY, nbRoad, railX, railY);
  }

  private generateModifiedObjects(modifType: boolean[], roadX: number, roadY: number, nbRoad: number, railX: number, railY: number): void {
    const indexDiff: number[] = this.thematicObjectGeneratorService.getIndexDiff();
    this.differenceThematicGeneratorService.initialize(modifType, this.originalObjects, indexDiff);
    this.modifiedObjects = this.differenceThematicGeneratorService.generateDifference(roadX, roadY, nbRoad, railX, railY);
    this.originalObjects = this.differenceThematicGeneratorService.getOriginalObjects();
  }

}
