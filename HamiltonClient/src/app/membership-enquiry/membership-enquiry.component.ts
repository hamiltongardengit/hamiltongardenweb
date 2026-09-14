import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { API } from '../../services/api-enum/api.enum';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-membership-enquiry',
  templateUrl: './membership-enquiry.component.html',
  styleUrls: ['./membership-enquiry.component.css']
})
export class MembershipEnquiryComponent implements OnInit {
  membershipEnquiryForm: FormGroup;
  enquirySent = false;
  submitted = false;

  constructor(private fb: FormBuilder, private commonService: CommonService) { }

  ngOnInit(): void {
    this.membershipEnquiryForm = this.fb.group({
      name: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      currentCity: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.membershipEnquiryForm.markAllAsTouched();
    if (this.membershipEnquiryForm.invalid) {
      return;
    }

    const request = {
      name: this.membershipEnquiryForm.get('name')?.value,
      mobile: this.membershipEnquiryForm.get('mobile')?.value,
      email: this.membershipEnquiryForm.get('email')?.value,
      currentCity: this.membershipEnquiryForm.get('currentCity')?.value,
      age: this.membershipEnquiryForm.get('age')?.value,
      message: this.membershipEnquiryForm.get('message')?.value
    };

    this.commonService.postRequest(request, API.submit_enquiry).subscribe((res: any) => {
      if (res?.success) {
        this.enquirySent = true;
        this.membershipEnquiryForm.reset();
        this.submitted = false;
      }
    });
  }
}