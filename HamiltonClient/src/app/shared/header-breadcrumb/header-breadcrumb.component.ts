import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-breadcrumb',
  templateUrl: './header-breadcrumb.component.html',
  styleUrls: ['./header-breadcrumb.component.css']
})
export class HeaderBreadcrumbComponent implements OnInit {
  @Input() breadcrumbTitle: string = '';

  constructor() { }

  ngOnInit() {
  }

}
