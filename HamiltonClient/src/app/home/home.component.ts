import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isScrollTopVisible: boolean = false;

  constructor() { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrollTopVisible = window.scrollY > 50;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
