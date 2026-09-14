import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminAPI, API } from '../../../services/api-enum/api.enum';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  activeTab = 'home';
  generalInfoForm: FormGroup;
  membershipInfoForm: FormGroup;
  isSubmitForm: boolean = false;
  isEditMode: boolean = false;
  user: any;
  showPassword: boolean = false;
  @ViewChild('datatable') datatable: any;
  cols = [
    { field: 'destination', title: 'Destination' },
    { field: 'location', title: 'Location' },
    { field: 'totalDaysAllowed', title: 'Days Allowed' },
    { field: 'daysUsed', title: 'Day Used' },
    { field: 'daysLeft', title: 'Day Left' },
  ];
  items = [];
  params = {
    current_page: 1,
    pagesize: 10,
    keyword: '',
    userId: '',
  };
  timer: any;
  loading: boolean = true;
  total_rows: number = 0;
  docData: any;

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService) { }

  ngOnInit(): void {
    this.initForm();
    this.getProfileData();
  }

  getProfileData() {
    this.commonService.getRequest(API.profile).subscribe((res: any) => {
      if (res?.success) {
        this.user = res?.user;
        this.docData = this.user?.agreement;
        this.populateForm(res?.user);
      }
    });
  }

  initForm() {
    this.generalInfoForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['user', Validators.required],
      address: ['', [Validators.required, Validators.minLength(6)]],
      city: ['', Validators.required]
    });
  }

  populateForm(user): void {
    this.generalInfoForm.patchValue({
      firstname: user?.firstname,
      lastname: user?.lastname,
      email: user?.email,
      contactNumber: user?.contactNumber,
      role: user?.role,
      address: user?.address,
      city: user?.city
    });
  }

  onSave(): void {
    this.isSubmitForm = true;
    if (this.generalInfoForm.valid) {
      const formData = this.generalInfoForm.value;

        this.commonService.putRequest(formData, API.update_profile, this.user?._id).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Updated!",
              text: "Your Details has been updated.",
              icon: "success"
            });
            this.isSubmitForm = false;
            this.getProfileData();
          }
        });
    } else {
      this.generalInfoForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Membership Info
  populateMembershipData() {
    this.membershipInfoForm = this.fb.group({
      membership: [{ value: 'ps', disabled: true }],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
      totalDaysAllowed: [{ value: 0, disabled: true }],
      daysUsed: [{ value: 0, disabled: true }],
      daysLeft: [{ value: 0, disabled: true }],
    });
    this.params.userId = this.user?._id;
    this.commonService.postRequest(this.params, API.get_usage_history).subscribe((res: any) => {
      if (res) {
        this.items = res?.usageRecords;
        this.total_rows = res?.pagination?.total;
        if (this.items.length > 0) {
          const patchData = this.items[0];
          this.membershipInfoForm.patchValue({
            membership: patchData?.membership || 'ps',
            startDate: new Date(patchData?.startDate).toISOString().split('T')[0],
            endDate: new Date(patchData?.endDate).toISOString().split('T')[0],
            totalDaysAllowed: patchData?.totalDaysAllowed || 0,
            daysUsed: patchData?.daysUsed || 0,
            daysLeft: patchData?.daysLeft || 0,
          });
        }
        this.loading = false;
      }
    });
  }

  changeServer(data: any) {
    this.params.current_page = data.current_page;
    this.params.pagesize = data.pagesize;
    this.populateMembershipData();
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }

}