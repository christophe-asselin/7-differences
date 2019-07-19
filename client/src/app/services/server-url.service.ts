import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ServerUrlService {

  public static readonly URL: string  = "http://localhost:3000";

}
