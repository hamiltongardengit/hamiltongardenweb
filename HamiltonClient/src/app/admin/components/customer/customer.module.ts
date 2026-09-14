import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { IconModule } from '../../shared/icon/icon.module';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';


@NgModule({
  declarations: [ListComponent, CreateComponent],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    IconModule,
    DataTableModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CustomerModule { }
