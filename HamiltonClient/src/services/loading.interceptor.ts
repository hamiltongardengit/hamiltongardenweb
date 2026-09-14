import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from './loading.service';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

    constructor(private loadingService: LoadingService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.loadingService.show();

        return next.handle(req).pipe(
            tap(
                (event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        this.loadingService.hide();
                    }
                },
                (error: HttpErrorResponse) => {
                    this.loadingService.hide();
                }
            ),
            finalize(() => {
                this.loadingService.hide();
            })
        );
    }
}
