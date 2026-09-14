// http-error.interceptor.ts
import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExceptionService } from './exception.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

    constructor(private exceptionService: ExceptionService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                
                let errorMessage = 'An unknown error occurred!';
                if (error.error instanceof ErrorEvent) {
                    errorMessage = `Client-side error: ${error.error.message}`;
                } else {
                    errorMessage = `${error?.error?.message ? error?.error?.message : 'We are sorry, an unknown error occurred. Please try again later.'}`;
                }

                // Use the notification service to set the error message
                this.exceptionService.showNotification(errorMessage);

                return throwError(errorMessage);
            })
        );
    }
}
