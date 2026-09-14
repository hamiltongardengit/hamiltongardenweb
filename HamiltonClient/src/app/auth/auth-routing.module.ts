import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { AuthGuard } from '../../services/auth.guard';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard] },
  { path: 'password/reset/:token', component: ResetPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
