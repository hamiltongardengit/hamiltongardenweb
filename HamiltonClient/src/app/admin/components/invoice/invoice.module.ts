import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { ListComponent } from './list/list.component';
import { IconModule } from '../../shared/icon/icon.module';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateComponent } from './create/create.component';


@NgModule({
  declarations: [ListComponent, CreateComponent],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    IconModule,
    DataTableModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class InvoiceModule { }
