import { Injectable } from '@angular/core';
import {catchError, map, Observable, throwError} from "rxjs";
import {Issue} from "../models/issue";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";

const headers = new HttpHeaders().set('Accept', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private readonly token!: string | null;
  private readonly headers = {};
  private readonly fileUploadHeaders = {};
  retry = 1;

  constructor(private http: HttpClient) {
    const csrf = document.head.querySelector('meta[name=\'_csrf\']');
    if (csrf !== null) {
      this.token = csrf.getAttribute('content');
      this.headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CSRF-TOKEN': this.token
      };
    }
  }

  public getHeaders() {
    return this.headers;
  }

  public handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error(error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  public getIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>('./assets/issues.json', { headers })
      .pipe(map((response: Issue[]) => {
          return response;
        }), catchError(this.handleError)
      );
  }
}
