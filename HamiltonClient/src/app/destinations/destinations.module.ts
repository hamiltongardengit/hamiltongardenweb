import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DestinationsRoutingModule } from './destinations-routing.module';
import { DestinationDetailComponent } from './destination-detail/destination-detail.component';
import { DestinationListComponent } from './destination-list/destination-list.component';
import { IconModule } from '../admin/shared/icon/icon.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LineBreakPipe } from '../../services/line-break.pipe';


@NgModule({
  declarations: [
    DestinationListComponent,
    DestinationDetailComponent,
    LineBreakPipe
  ],
  imports: [
    CommonModule,
    DestinationsRoutingModule,
    IconModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class DestinationsModule { }
