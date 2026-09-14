import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isNavbarCollapsed: boolean = true;
  isNavbarFixed: boolean = false;

  constructor(public auth: AuthService) { }

  collapseNavbar() {
    this.isNavbarCollapsed = true;
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isNavbarFixed = window.scrollY > 50;
  }

}
