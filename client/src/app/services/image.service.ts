import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { throwError, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { IImageValidationMessage } from "../../../../common/communication/IImageValidationMessage";
import { ServerUrlService } from "./server-url.service";

@Injectable({
  providedIn: "root",
})
export class ImageService {

    private static readonly BASE_URL: string = ServerUrlService.URL + "/api/image/";
    public constructor(private http: HttpClient) { }

    public verifyImage(formData: FormData): Observable<IImageValidationMessage> {

        return this.http.post<IImageValidationMessage>(ImageService.BASE_URL, formData).pipe(
            catchError(this.handleError),
        );
    }

    public dataUrlToBlob(url: string): Blob {
        const byteString: string = (url.split(",")[0].indexOf("base64") >= 0) ? atob(url.split(",")[1]) : unescape(url.split(",")[1]);
        const mimeString: string = url.split(",")[0].split(":")[1].split(";")[0];
        const byteArray: Uint8Array = new Uint8Array(byteString.length);

        for (let i: number = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
        }

        return new Blob([byteArray], { type: mimeString });
    }

    private handleError(error: HttpErrorResponse): Observable<never> {

        return throwError("Error communicating with server");
    }
}
