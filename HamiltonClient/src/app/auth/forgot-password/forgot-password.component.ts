import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API } from '../../../services/api-enum/api.enum';
import { Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isSubmitForm: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSave(): void {
    this.isSubmitForm = true;
    if (this.forgotPasswordForm.valid) {
      const formData = this.forgotPasswordForm.value;

      this.commonService.postRequest(formData, API.forgot_password).subscribe((res: any) => {
        if (res?.success) {
          Swal.fire({
            title: "Email Sent!",
            text: "Password Reset Link has been sent to your email.",
            icon: "success"
          });
          this.isSubmitForm = false;
          this.forgotPasswordForm.reset();
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
  

}
