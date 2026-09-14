import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { Error404Component } from './shared/error404/error404.component';
import { GalleryComponent } from './gallery/gallery.component';
import { FaqComponent } from './faq/faq.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { MembershipComponent } from './membership/membership.component';
import { AdminGuard } from '../services/admin.guard';
import { PaymentComponent } from './payment/payment.component';
import { MembershipEnquiryComponent } from './membership-enquiry/membership-enquiry.component';
import { MembershipBookingComponent } from './membership-booking/membership-booking.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'faqs', component: FaqComponent },
  { path: 'testimonials', component: TestimonialsComponent },
  { path: 'memberships', component: MembershipComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'membership-enquiry', component: MembershipEnquiryComponent },
  { path: 'membership-booking', component: MembershipBookingComponent },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  { path: 'destinations', loadChildren: () => import('./destinations/destinations.module').then(m => m.DestinationsModule) },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AdminGuard]
  },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
