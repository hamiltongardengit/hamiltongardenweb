import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '../../services/admin.guard';
import { AdminComponent } from './admin.component';
import { IndexComponent } from './components/index/index.component';
import { ReviewComponent } from './components/review/review.component';
import { MembershipEnquiriesComponent } from './components/membership-enquiries/membership-enquiries.component';
import { MembershipBookingComponent } from './components/membership-booking/membership-booking.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: IndexComponent },
      { path: 'reviews', component: ReviewComponent },
      { path: 'membership-enquiries', component: MembershipEnquiriesComponent },
      { path: 'membership-booking', component: MembershipBookingComponent },
      {
        path: 'user',
        loadChildren: () => import('./components/customer/customer.module').then(m => m.CustomerModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'destination',
        loadChildren: () => import('./components/destination/destination.module').then(m => m.DestinationModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'invoice',
        loadChildren: () => import('./components/invoice/invoice.module').then(m => m.InvoiceModule),
        canActivate: [AdminGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
