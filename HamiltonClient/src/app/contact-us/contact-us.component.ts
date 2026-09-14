import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { API } from '../../services/api-enum/api.enum';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  contactForm: FormGroup;
  messageSent = false;
  submitted = false;

  constructor(private fb: FormBuilder, private commonService: CommonService) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.contactForm.invalid) {
      this.submitted = false;
      return;
    }

    let request = {
      "name": this.contactForm.get('name')?.value,
      "email": this.contactForm.get('email')?.value,
      "subject": this.contactForm.get('subject')?.value,
      "message": this.contactForm.get('message')?.value
    }
    this.commonService.postRequest(request, API.contact).subscribe((res: any) => {
      if (res?.success) {
        this.messageSent = true;
        this.contactForm.reset();
      }
    });
  }
}
