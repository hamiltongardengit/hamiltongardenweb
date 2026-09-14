import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DestinationRoutingModule } from './destination-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { IconModule } from '../../shared/icon/icon.module';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';


@NgModule({
  declarations: [ListComponent, CreateComponent],
  imports: [
    CommonModule,
    DestinationRoutingModule,
    IconModule,
    DataTableModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DestinationModule { }
