import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExceptionService {
  private notificationSubject = new Subject<string>();
  notification$ = this.notificationSubject.asObservable();
  
  constructor() { }

  showNotification(message: string) {
    this.notificationSubject.next(message);
  }

  clearNotification() {
    this.notificationSubject.next('');
  }

}
