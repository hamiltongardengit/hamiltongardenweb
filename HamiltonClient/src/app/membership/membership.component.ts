import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css']
})
export class MembershipComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateToBooking(value) {
    if (value === 'enquiry') {
      this.router.navigate(["/membership-enquiry"]);
    }
    else {
      sessionStorage.setItem('typeOfMembership', value);
      this.router.navigate(["/membership-booking"]);
    }
  }

}
