import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { IDifferenceIdentificationMessage } from "../../../../common/communication/IDifferenceIdentificationMessage";
import { ServerUrlService } from "./server-url.service";

@Injectable({
  providedIn: "root",
})
export class SimpleDifferenceService {

  private static readonly BASE_URL: string = ServerUrlService.URL + "/api/identification";

  public constructor(private http: HttpClient) { }

  public checkIfDifference(gameID: string, x: number, y: number, formData: FormData): Observable<IDifferenceIdentificationMessage> {

    return this.http.post<IDifferenceIdentificationMessage>(this.generateURL(gameID, x, y), formData).pipe(
        catchError(this.handleError),
    );
  }

  private generateURL(id: string, x: number, y: number): string {

    return SimpleDifferenceService.BASE_URL + "/simple/" + id + "/" + x + "/" + y;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {

    return throwError("Error communicating with server");
  }
}
