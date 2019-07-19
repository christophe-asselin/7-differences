import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { throwError, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { ServerUrlService } from "./server-url.service";

@Injectable({
  providedIn: "root",
})
export class ConnectService {
  private static readonly BASE_URL: string = ServerUrlService.URL + "/api/user/";

  public constructor(private http: HttpClient) {
  }

  public addUsername(username: string): Observable<string> {

    return this.http.get<string>(ConnectService.BASE_URL + "connect/" + username + "/").pipe(
      catchError(this.handleError),
    );

  }

  private handleError(error: HttpErrorResponse): Observable<never> {

    return throwError("Error communicating with server");
  }
}
