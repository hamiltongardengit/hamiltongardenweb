import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './shared/header/header.component';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FooterComponent } from './shared/footer/footer.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { GalleryComponent } from './gallery/gallery.component';
import { FaqComponent } from './faq/faq.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CounterDirective } from '../directives/counter.directive';
import { CtaComponent } from './shared/cta/cta.component';
import { TestimonialComponent } from './shared/testimonial/testimonial.component';
import { SubTeamComponent } from './shared/sub-team/sub-team.component';
import { CounterComponent } from './shared/counter/counter.component';
import { MembershipComponent } from './membership/membership.component';
import { AuthModule } from './auth/auth.module';
import { SubGalleryComponent } from './shared/sub-gallery/sub-gallery.component';
import { DestinationsModule } from './destinations/destinations.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from '../services/auth.interceptor';
import { LoadingInterceptor } from '../services/loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { LoadingComponent } from './shared/loading/loading.component';
import { ExceptionErrorComponent } from './shared/exception-error/exception-error.component';
import { ExceptionService } from '../services/exception.service';
import { HttpErrorInterceptor } from '../services/http-error.interceptor';
import { NgIdleModule } from '@ng-idle/core';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { PaymentComponent } from './payment/payment.component';
import { HeroSliderComponent } from './shared/hero-slider/hero-slider.component';
import { MembershipEnquiryComponent } from './membership-enquiry/membership-enquiry.component';
import { MembershipBookingComponent } from './membership-booking/membership-booking.component';


@NgModule({
  declarations: [													
    AppComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    ContactUsComponent,
    AboutUsComponent,
      GalleryComponent,
      FaqComponent,
      PrivacyPolicyComponent,
      TestimonialsComponent,
    TermsOfServiceComponent,
    CounterDirective,
    CtaComponent,
    TestimonialComponent,
    SubTeamComponent,
    SubGalleryComponent,
    CounterComponent,
    MembershipComponent,
    LoadingComponent,
      ExceptionErrorComponent,
    PaymentComponent,
      HeroSliderComponent,
      MembershipEnquiryComponent,
      MembershipBookingComponent
   ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    AuthModule,
    DestinationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgIdleModule.forRoot(),
    NgIdleKeepaliveModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    LoadingService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    ExceptionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
