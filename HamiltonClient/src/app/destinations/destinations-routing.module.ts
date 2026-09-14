import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DestinationDetailComponent } from './destination-detail/destination-detail.component';
import { DestinationListComponent } from './destination-list/destination-list.component';

const routes: Routes = [
  { path: 'list', component: DestinationListComponent },
  { path: 'detail', component: DestinationDetailComponent }
  // { path: 'detail/:id', component: DestinationDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DestinationsRoutingModule { }
