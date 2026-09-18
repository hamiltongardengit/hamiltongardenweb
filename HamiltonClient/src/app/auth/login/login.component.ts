import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  OTPsubmitted = false;
  otpForm: FormGroup;
  otpStep = false;  // flag for OTP screen
  emailForOtp: string = '';
  userId: any;
  showAgreementModal = false;
  agreementChecked = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private renderer: Renderer2) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.submitted = false;
      return;
    }

    let request = {
      "email": this.loginForm.get('email')?.value,
      "password": this.loginForm.get('password')?.value
    }
    this.authService.login(request).subscribe(res => {
      if (res?.success) {
        // Switch to OTP step
        this.otpStep = true;
        this.emailForOtp = request.email;
        this.userId = res?.userId;
        // Disable body scroll
        this.renderer.addClass(document.body, 'overflow-hidden');
      } else if (res?.success && res?.token) {
        // this.authService.storeToken(res.token);
        this.router.navigate(['/home']);
      }

    });
  }

  verifyOtp() {
    this.OTPsubmitted = true;
    if (this.otpForm.invalid) {
      this.OTPsubmitted = false;
      return;
    }

    const { userId, otp} = {
      userId: this.userId,
      otp: this.otpForm.get('otp')?.value
    };

    this.authService.verifyOtp(userId,otp).subscribe(res => {
      if (res?.success && res?.token) {
        if (res.agreementAccepted) {
          // Agreement already accepted → continue normal flow
          this.otpStep = false;
          this.renderer.removeClass(document.body, 'overflow-hidden');
          this.router.navigate(['/home']);
        } else {
          // Show agreement modal
          this.otpStep = false;
          this.router.navigate(['/home']);
          // this.showAgreementModal = true;
        }
      } else {
        alert("Invalid OTP, please try again.");
      }
    });
  }

  acceptAgreement() {
    // this.authService.acceptAgreement(this.emailForOtp).subscribe(res => {
    //   if (res?.success) {
    //     this.showAgreementModal = false;
    //     this.otpStep = false;
    //     this.renderer.removeClass(document.body, 'overflow-hidden');
    //     this.router.navigate(['/home']);
    //   }
    // });
  }

  closeAgreementModal() {
    this.showAgreementModal = false;
    // Optional: You can also log out user or reset OTP if they cancel
  }

}