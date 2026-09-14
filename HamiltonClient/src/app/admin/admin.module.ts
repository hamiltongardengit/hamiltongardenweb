import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { IconModule } from './shared/icon/icon.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { StoreModule } from '@ngrx/store';
import { indexReducer } from './store/index.reducer';
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';
import { FooterComponent } from './layouts/footer';
import { HeaderComponent } from './layouts/header';
import { SidebarComponent } from './layouts/sidebar';
import { ThemeCustomizerComponent } from './layouts/theme-customizer';
import { IndexComponent } from './components/index/index.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuModule } from 'headlessui-angular';
import { AppService } from './service/app.service';
import { ReviewComponent } from './components/review/review.component';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { MembershipEnquiriesComponent } from './components/membership-enquiries/membership-enquiries.component';
import { MembershipBookingComponent } from './components/membership-booking/membership-booking.component';


@NgModule({
  declarations: [
    AdminComponent, HeaderComponent, FooterComponent, SidebarComponent, ThemeCustomizerComponent, IndexComponent, AppLayout, AuthLayout,
    ReviewComponent, MembershipEnquiriesComponent, MembershipBookingComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    IconModule,
    NgScrollbarModule,
    StoreModule.forRoot({ index: indexReducer }),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MenuModule,
    DataTableModule,
  ],
  // styles: [`@import 'src/app/admin/admin.styles.css';`],
  providers: [AppService],
})
export class AdminModule { }
