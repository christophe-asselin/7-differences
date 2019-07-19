import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import * as THREE from "three";
import { ServerUrlService } from "./server-url.service";

@Injectable({
  providedIn: "root",
})
export class FreeDifferenceService {

  private static readonly BASE_URL: string = ServerUrlService.URL + "/api/identification";

  private raycaster: THREE.Raycaster;
  public originalSceneObjects: THREE.Group;
  public camera: THREE.PerspectiveCamera;

  public constructor(private http: HttpClient) {
    this.raycaster = new THREE.Raycaster();
    this.originalSceneObjects = new THREE.Group;
    this.camera = new THREE.PerspectiveCamera;
  }

  public setOriginalSceneObjects(originalSceneObjects: THREE.Group): void {
    this.originalSceneObjects = originalSceneObjects;
  }

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
  }

  public findClickedObjectIndex(clickPosition: THREE.Vector2): number {
    this.raycaster.setFromCamera(clickPosition, this.camera);

    const intersectedOriginalObjects: THREE.Intersection[] =
    this.raycaster.intersectObjects(this.originalSceneObjects.children, true);
    if (intersectedOriginalObjects.length !== 0) {

      return intersectedOriginalObjects[0].object.userData.index;
    } else {

      return -1;
    }
  }

  public compareObjectInScenes(gameID: string, objectIndex: number): Observable<boolean> {
    return this.http.get<boolean>(this.generateURL(gameID, objectIndex)).pipe(
      catchError(this.handleError),
    );
  }

  private generateURL(gameID: string, index: number): string {
    return FreeDifferenceService.BASE_URL + "/free/" + gameID + "/" + index;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError("Error communicating with server");
  }

}
