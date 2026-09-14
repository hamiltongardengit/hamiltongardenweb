import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private auth: AuthService, private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.auth.getToken();

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // If a 401 error occurs, it typically means the token is expired or invalid
                    this.auth.logout();  // Optionally clear token and other user data
                    this.router.navigate(['/auth/login']);  // Redirect to the login page
                }
                return throwError(error);  // Re-throw the error to be handled by other interceptors or services
            })
        );
    }
}