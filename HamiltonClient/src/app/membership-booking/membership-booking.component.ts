import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { API } from '../../services/api-enum/api.enum';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-membership-booking',
  templateUrl: './membership-booking.component.html',
  styleUrls: ['./membership-booking.component.css']
})
export class MembershipBookingComponent implements OnInit {
membershipBookingForm: FormGroup;
  bookingSent = false;
  submitted = false;
  membershipPackages = [
    {
      value: 'Purple Membership',
      label: 'Purple Package',
      info: '25 years Holiday Package | 2 Adults + 2 Kids below 12 years | Apartment - Studio'
    },
    {
      value: 'Red Membership',
      label: 'Red Package',
      info: '25 years Holiday Package | 2 Adults + 2 Kids below 12 years | Apartment - Studio'
    },
    {
      value: 'White Membership',
      label: 'White Package',
      info: '25 years Holiday Package | 2 Adults + 2 Kids below 12 years | Apartment - Studio'
    },
    {
      value: 'Blue Membership',
      label: 'Blue Package',
      info: '25 years Holiday Package | 2 Adults + 2 Kids below 12 years | Apartment - Studio'
    }
  ];

  constructor(private fb: FormBuilder, private commonService: CommonService) { }

  ngOnInit(): void {
    const typeOfMembership = sessionStorage.getItem('typeOfMembership') || 'ps';

    this.membershipBookingForm = this.fb.group({
      name: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      currentCity: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
      membership: [typeOfMembership, Validators.required],
      membershipInfo: [{ value: '', disabled: true }],
      message: ['', Validators.required]
    });

    // Automatically set membership info if a valid type is stored
    if (typeOfMembership !== 'ps') {
      this.setMembershipInfo(typeOfMembership);
    }
  }

  setMembershipInfo(value: Event | string): void {
    // Check if the value is an event (i.e., coming from the <select> change event)
    const selectedValue = value instanceof Event
      ? (value.target as HTMLSelectElement).value
      : value;  // Otherwise, it's directly a string value

    // Find the corresponding membership package details
    const selectedPackage = this.membershipPackages.find(pkg => pkg.value === selectedValue);

    // Update the membershipInfo field with the appropriate details
    const membershipInfo = selectedPackage ? selectedPackage.info : '';
    this.membershipBookingForm.get('membershipInfo').setValue(membershipInfo);
  }


  onSubmit(): void {
    this.submitted = true;
    this.membershipBookingForm.markAllAsTouched();
    if (this.membershipBookingForm.invalid || this.membershipBookingForm.get('membership').value == 'ps') {
      return;
    }

    const request = {
      name: this.membershipBookingForm.get('name')?.value,
      mobile: this.membershipBookingForm.get('mobile')?.value,
      email: this.membershipBookingForm.get('email')?.value,
      address: this.membershipBookingForm.get('address')?.value,
      currentCity: this.membershipBookingForm.get('currentCity')?.value,
      age: this.membershipBookingForm.get('age')?.value,
      membership: this.membershipBookingForm.get('membership')?.value,
      message: this.membershipBookingForm.get('message')?.value
    };

    this.commonService.postRequest(request, API.submit_membership_booking).subscribe((res: any) => {
      if (res?.success) {
        this.bookingSent = true;
        this.membershipBookingForm.reset();
        this.submitted = false;
      }
    });
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('typeOfMembership');
  }
}