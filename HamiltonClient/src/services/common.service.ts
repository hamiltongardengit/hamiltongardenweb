import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private apiURL = environment.apiURL;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHttpOptions(acceptType: string = 'application/json', contentType: string = 'application/json'): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': contentType,
        Accept: acceptType,
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Role': this.authService.getUserRole(),
      }),
    };
  }


  getRequest<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.apiURL}${url}`, this.getHttpOptions())
      .pipe(catchError(this.errorHandler));
  }

  postRequest<T>(baseRequest: T, url: string): Observable<T> {
    return this.http.post<T>(`${this.apiURL}${url}`, baseRequest, this.getHttpOptions())
      .pipe(catchError(this.errorHandler));
  }

  postFormData(formData: FormData, url: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Role': this.authService.getUserRole()
    });

    return this.http.post(`${this.apiURL}${url}`, formData, {
      headers: headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(catchError(this.errorHandler));
  }

  find<T>(id: number, url: string): Observable<T> {
    return this.http.get<T>(`${this.apiURL}${url}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.errorHandler));
  }

  putRequest<T>(baseRequest: T, url: string, id?: any): Observable<T> {
    return this.http.put<T>(`${this.apiURL}${url}${id ? '/' + id : ''}`, baseRequest, this.getHttpOptions())
      .pipe(catchError(this.errorHandler));
  }

  putFormData(formData: FormData, url: string, id?: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Role': this.authService.getUserRole()
    });

    return this.http.put(`${this.apiURL}${url}${id ? '/' + id : ''}`, formData, {
      headers: headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(catchError(this.errorHandler));
  }

  deleteRequest(url: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}${url}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.errorHandler));
  }

  exportFile(url: string): Observable<Blob> {
    return this.http.get(`${this.apiURL}${url}`, {
      headers: this.getHttpOptions('application/pdf').headers,
      responseType: 'blob'
    }).pipe(catchError(this.errorHandler));
  }
  
  exportToCSV(url: string): Observable<Blob> {
    return this.http.get(`${this.apiURL}${url}`, {
      headers: this.getHttpOptions('text/csv').headers,
      responseType: 'blob'
    }).pipe(catchError(this.errorHandler));
  }

  downloadFile(blob: Blob, fileName: string): void {
    // Create a URL for the Blob
    const downloadURL = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger a download
    const anchor = document.createElement('a');
    anchor.href = downloadURL;
    anchor.download = fileName;
    anchor.click();

    // Revoke the object URL after the file is downloaded
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadURL);
    }, 100);
  }

  private errorHandler(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}