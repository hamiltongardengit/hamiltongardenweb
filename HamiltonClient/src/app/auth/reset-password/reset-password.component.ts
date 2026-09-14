import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import Swal from 'sweetalert2';
import { API } from '../../../services/api-enum/api.enum';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isSubmitForm: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  token: string;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private commonService: CommonService) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    }, { validators: this.passwordMatchValidator });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSave(): void {
    this.isSubmitForm = true;
    if (this.resetPasswordForm.valid) {
      this.route.paramMap.subscribe(params => {
        this.token = params.get('token');
      });
      const formData = this.resetPasswordForm.value;

      this.commonService.putRequest(formData, API.reset_password, this.token).subscribe((res: any) => {
        if (res?.success) {
          Swal.fire({
            title: "Updated!",
            text: "Your Password has been updated.",
            icon: "success"
          });
          this.token = '';
          this.isSubmitForm = false;
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  // Custom Validator for matching passwords
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

}
