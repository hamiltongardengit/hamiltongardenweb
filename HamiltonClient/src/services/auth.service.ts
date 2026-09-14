import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiURL;
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private idleState = 'Not started.';
  private timedOut = false;
  private idleTimeout: number = Number(environment.idleTimeout) || 1800; // (in seconds)
  private keepAliveInterval = 10; // Keepalive interval (in minutes)

  constructor(private http: HttpClient, private idle: Idle, private router: Router) {
    this.setupIdle();
   }

  login(creds : Object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}login`, creds, { withCredentials: true }).pipe(
      tap(user => {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.resetIdle(); // Start watching for idle after successful login
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']); 
  }

  isLoggedIn() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    return user !== null;
  }

  getToken(): string {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    return user ? user.token : null;
  }

  isAdmin(): boolean {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    return user ? user?.user?.role === 'admin' : false;
  }
  getUserRole(): string | null {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    return user ? user.user?.role : 'user';
  }

  setupIdle() {
    // Set idle timeout (how long before considering user idle)
    this.idle.setIdle(this.idleTimeout);

    // Set timeout period (after idle period, how long before logging out)
    this.idle.setTimeout(60); // 60 seconds countdown

    // Set the default interrupt sources (e.g., mouse, keyboard events)
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
    });

    this.idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      this.logout(); // Call logout method when timed out
    });

    this.idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!';
    });

    this.idle.onTimeoutWarning.subscribe((countdown: number) => {
      this.idleState = `You will be logged out in ${countdown} seconds!`;
    });

    // Start watching for idle time
    this.resetIdle();
  }

  resetIdle() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

}