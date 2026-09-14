import { Component, OnInit } from '@angular/core';
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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
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
        this.loginForm.reset();
        this.router.navigate(['/home']);
      }

    });
  }

}