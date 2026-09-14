import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '../admin/shared/icon/icon.module';
import { DataTableModule } from '@bhplugin/ng-datatable';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordComponent,
    MyProfileComponent,
    ResetPasswordComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    IconModule,
    DataTableModule,
    SharedModule
  ]
})
export class AuthModule { }
