import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ExceptionService } from '../services/exception.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showHeaderFooter: boolean = true;
  
  constructor(private router: Router, public exceptionService: ExceptionService, private authService: AuthService) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Check if the current route starts with /admin
        this.showHeaderFooter = !event.url.startsWith('/admin');
      }
    });
  }
}
