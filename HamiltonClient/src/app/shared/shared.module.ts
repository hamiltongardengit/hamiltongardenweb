import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { HeaderBreadcrumbComponent } from './header-breadcrumb/header-breadcrumb.component';


@NgModule({
  declarations: [HeaderBreadcrumbComponent],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports:[HeaderBreadcrumbComponent],
})
export class SharedModule { }
