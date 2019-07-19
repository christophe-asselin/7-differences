import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { throwError, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { GameMode, GameType } from "../../../../common/GameEnum";
import { IDuoGame } from "../../../../common/IDuoGame";
import { IFreeGame } from "../../../../common/IFreeGame";
import { ISimpleGame } from "../../../../common/ISimpleGame";
import { ServerUrlService } from "./server-url.service";

@Injectable({
  providedIn: "root",
})
export class GameService {

  private static readonly BASE_URL: string = ServerUrlService.URL + "/api/game/";
  public constructor(private http: HttpClient) { }

  public getGames(type: GameType): Observable<ISimpleGame[] | IFreeGame[]> {

    return this.http.get<ISimpleGame[] | IFreeGame[]>(GameService.BASE_URL + "games/" + type).pipe(
        catchError(this.handleError),
    );
  }

  public getGame(id: string, type: GameType, nPlayers: GameMode): Observable<ISimpleGame | IFreeGame> {

    return this.http.get<ISimpleGame | IFreeGame>(GameService.BASE_URL + "games/" + type + "/" + nPlayers + "/" + id).pipe(
        catchError(this.handleError),
    );
  }

  public getDuoGame(username: string): Observable<IDuoGame> {

    return this.http.get<IDuoGame>(GameService.BASE_URL + "duoGames/" + username).pipe(
        catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {

    return throwError("Error communicating with server");
  }

}
