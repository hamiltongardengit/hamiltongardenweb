import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAPI } from '../../../../../services/api-enum/api.enum';
import Swal from 'sweetalert2';
import { CommonService } from '../../../../../services/common.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  activeTab = 'home';
  generalInfoForm: FormGroup;
  membershipInfoForm: FormGroup;
  isSubmitForm: boolean = false;
  isSubmitMembershipInfoForm: boolean = false;
  isEditMode: boolean = false;
  userId: any;
  showPassword: boolean = false;
  todayDate: string;
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
  destinations: any;
  totalDaysUsed = 0;
  imagePreviews: string[] = [];
  selectedImages = [];
  removedImages = [];
  docData: any;
  isOtherDestinationSelected: boolean = false;
  employeeList = [];

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService, private auth: AuthService) { }

  ngOnInit(): void {
    const storedUserData = sessionStorage.getItem('generalInfoData');
    this.todayDate = new Date().toISOString().split('T')[0];
    this.getAllEmployee();

    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        if (user._id) {
          this.userId = user._id;
          this.docData = user?.agreement;
        }
        this.populateForm(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('generalInfoData');
      }
    } else {
      this.initForm();
    }
    if (this.auth.getUserRole()?.includes('employee_view')) {
      this.generalInfoForm.disable();
    }
  }

  getAllEmployee() {
    const params = {
      current_page: 1,
      pagesize: 100,
    };
    this.commonService.postRequest(params, AdminAPI.get_all_employeee).subscribe((res: any) => {
      if (res) {
        this.employeeList = res?.employees;
      }
    })
  }

  initForm() {
    this.generalInfoForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['user', Validators.required],
      assignedEmployee: [''],
      address: ['', [Validators.required, Validators.minLength(6)]],
      city: ['', Validators.required],
      birthdate: ['', Validators.required],
      anniversaryDate: [''],
    });
  }

  populateForm(user): void {
    this.generalInfoForm = this.fb.group({
      firstname: [user?.firstname, [Validators.required, Validators.minLength(2)]],
      lastname: [user?.lastname, [Validators.required, Validators.minLength(2)]],
      email: [user?.email, [Validators.required, Validators.email]],
      contactNumber: [user?.contactNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.minLength(8)]],
      role: [user?.role, Validators.required],
      assignedEmployee: [user?.assignedEmployee || ''],
      address: [user?.address, [Validators.required, Validators.minLength(6)]],
      city: [user?.city, Validators.required],
      birthdate: [user?.birthdate ? new Date(user?.birthdate).toISOString().split('T')[0] : '', Validators.required],
      anniversaryDate: [user?.anniversaryDate ? new Date(user?.anniversaryDate).toISOString().split('T')[0] : ''],
    });
    if (this.docData?.public_id) {
      this.imagePreviews.push('../../../../../assets/admin/images/pdf-preview.png');
      this.selectedImages.push(this.docData);
    }
  }

  onSave(): void {
    this.isSubmitForm = true;
    if (this.generalInfoForm.valid) {
      this.isSubmitForm = false;
      const formData = this.generalInfoForm.value;

      if (this.userId) {
        this.commonService.putRequest(formData, AdminAPI.update_profile, this.userId).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Updated!",
              text: "User Details has been updated.",
              icon: "success"
            });
            this.router.navigate(['/admin/user/list']);
          }
        });
      } else {
        this.commonService.postRequest(formData, AdminAPI.register).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Created!",
              text: "User has been created.",
              icon: "success"
            });
            this.router.navigate(['/admin/user/list']);
          }
        });
      }
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
      membership: ['ps'],
      destinationId: ['ps'],
      manualDestination: [''],
      manualDestinationLocation: [''],
      startDate: [this.todayDate, Validators.required],
      endDate: [this.todayDate, Validators.required],
      totalDaysAllowed: [0 , [Validators.required, Validators.min(0)]],
      daysUsed: [0, [Validators.required, Validators.min(0)]],
      daysLeft: [{ value: 0, disabled: true }, , [Validators.required, Validators.min(0)]],
    });
    // Listen for changes on destinationId to reset manualDestination field if necessary
    this.membershipInfoForm.get('destinationId').valueChanges.subscribe(value => {
      if (value !== 'Other') {
        this.isOtherDestinationSelected = false;
        this.membershipInfoForm.get('manualDestination').reset();
        this.membershipInfoForm.get('manualDestinationLocation').reset();
      }
    });
    this.params.userId = this.userId;
    this.commonService.postRequest(this.params, AdminAPI.get_usage_history).subscribe((res: any) => {
      if (res) {
        this.items = res?.usageRecords;
        this.destinations = res?.destinations;
        this.total_rows = res?.pagination?.total;
        if (this.items.length > 0) {
          const patchData = this.items[0];
          this.totalDaysUsed = res?.totalDaysUsed || 0;

          // Determine whether to use destination or manualDestination
          const isManualDestination = !patchData?.destination && patchData?.manualDestination;

          this.membershipInfoForm.patchValue({
            membership: patchData?.membership || 'ps',
            destinationId: isManualDestination ? 'Other' : patchData?.destination?._id || 'ps', // If manual destination, select "other"
            manualDestination: isManualDestination ? patchData?.manualDestination : '', // Patch manual destination only if selected
            manualDestinationLocation: isManualDestination ? patchData?.destinationLocation : '', // Patch manual location only if selected
            startDate: new Date(patchData?.startDate).toISOString().split('T')[0],
            endDate: new Date(patchData?.endDate).toISOString().split('T')[0],
            totalDaysAllowed: patchData?.totalDaysAllowed || 0,
            daysUsed: this.totalDaysUsed || 0,
            daysLeft: patchData?.daysLeft || 0,
          });

          // Show or hide the manual destination input based on the selected option
          this.isOtherDestinationSelected = isManualDestination;
        }
        this.loading = false;
      }
    });
    // Add listeners for changes in startDate, endDate, and daysUsed
    this.membershipInfoForm.get('startDate')?.valueChanges.subscribe(() => this.calculateDays());
    this.membershipInfoForm.get('endDate')?.valueChanges.subscribe(() => this.calculateDays());
    this.membershipInfoForm.get('daysUsed')?.valueChanges.subscribe(() => this.calculateDays());
  }

  // Method to calculate total days and days left
  calculateDays() {
    const startDate = new Date(this.membershipInfoForm.get('startDate')?.value);
    const endDate = new Date(this.membershipInfoForm.get('endDate')?.value);
    const daysUsed = this.membershipInfoForm.get('daysUsed')?.value || 0;

    if (startDate && endDate) {
      const timeDiff = endDate.getTime() - startDate.getTime();
      const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
      const daysAllowed = this.membershipInfoForm.get('totalDaysAllowed')?.value || 0;
      // Adjusting the calculation to use latestDaysLeft
      const daysUsedCalculation = daysAllowed - (this.totalDaysUsed + daysUsed);

      this.membershipInfoForm.patchValue({
        // totalDaysAllowed: totalDays > 0 ? totalDays : 0,
        daysLeft: daysUsedCalculation > 0 ? daysUsedCalculation : 0
      });
    }
  }

  changeServer(data: any) {
    this.params.current_page = data.current_page;
    this.params.pagesize = data.pagesize;
    this.populateMembershipData();
  }

  onDestinationChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (selectedValue === 'Other') {
      this.isOtherDestinationSelected = true;
      this.membershipInfoForm.get('manualDestination').setValidators([Validators.required]); // Set validation for manual destination
      this.membershipInfoForm.get('manualDestination').updateValueAndValidity();
      this.membershipInfoForm.get('manualDestinationLocation').setValidators([Validators.required]); // Set validation for manual destination
      this.membershipInfoForm.get('manualDestinationLocation').updateValueAndValidity();
    } else {
      this.isOtherDestinationSelected = false;
      this.membershipInfoForm.get('manualDestination').clearValidators(); // Clear manual destination validators if not selected
      this.membershipInfoForm.get('manualDestination').updateValueAndValidity();
      this.membershipInfoForm.get('manualDestinationLocation').clearValidators(); // Clear manual destination validators if not selected
      this.membershipInfoForm.get('manualDestinationLocation').updateValueAndValidity();
    }
  }

  onMembershipSave(): void {
    this.isSubmitMembershipInfoForm = true;
    if (this.membershipInfoForm.valid) {
      this.isSubmitMembershipInfoForm = false;
      const formData = this.membershipInfoForm.getRawValue();
      if (formData.membership === 'ps') {
        delete formData.membership;
      }
      if (formData.destinationId === 'ps') {
        delete formData.destinationId;
        delete formData.manualDestination;
        delete formData.manualDestinationLocation;
      }
      if (formData.destinationId !== 'Other') {
        delete formData.manualDestination;
        delete formData.manualDestinationLocation;
      }
      formData.userId = this.userId;
      if (this.userId) {
        this.commonService.postRequest(formData, AdminAPI.add_usage).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Updated!",
              text: "Membership Details has been updated.",
              icon: "success"
            });
            this.populateMembershipData();
          }
        });
      }
    } else {
      this.membershipInfoForm.markAllAsTouched();
    }
  }

  onImageChange(event: any) {
    const files: File[] = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.type === 'application/pdf') {
        this.selectedImages.push(file);
        this.imagePreviews.push('../../../../../assets/admin/images/pdf-preview.png'); // replace with your actual icon path
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push(file);
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number) {
    if (this.docData?.public_id) {
      this.deleteAgreement(this.docData?.public_id,index);
      return;
    }
    const removedImage = this.selectedImages[index]?.public_id;
    if (typeof removedImage === 'string') {
      this.removedImages.push(removedImage);
    }
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onAgreementSave(): void {
    if (this.userId) {
      const formData = new FormData();
      formData.append('userId', this.userId);

      // Add new images
      this.selectedImages.forEach((file, index) => {
        if (file instanceof File) {  // Only append if it's a new file
          formData.append('document', file, file.name);
        }
      });

      // Append removed image URLs if there are any
      if (this.removedImages.length > 0) {
        formData.append('removedImages', JSON.stringify(this.removedImages));
      }

      this.commonService.postFormData(formData, AdminAPI.upload_agreement).subscribe((res: any) => {
        if (res?.body?.success) {
          Swal.fire({
            title: "Created!",
            text: "Agreement has been uploaded.",
            icon: "success"
          });
          this.router.navigate(['/admin/user/list']);
        }
      });
    }
  }

  deleteAgreement(id: any = null,index) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.commonService.deleteRequest(AdminAPI.agreement, this.userId).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Deleted!",
              text: "User Agreement has been deleted.",
              icon: "success"
            });
            const removedImage = this.selectedImages[index]?.public_id;
            if (typeof removedImage === 'string') {
              this.removedImages.push(removedImage);
            }
            this.selectedImages.splice(index, 1);
            this.imagePreviews.splice(index, 1);
            this.router.navigate(['/admin/user/list']);
          }
        });
      }
    });
  }

  onAssignEmployee() {
    const assignedEmployee = this.generalInfoForm.get('assignedEmployee').value;
    if (assignedEmployee) {
      const data = {
        customerIds: [this.userId],
        employeeId: assignedEmployee
      };
      this.commonService.postRequest(data, AdminAPI.assign_customers_to_employee).subscribe((res: any) => {
        if (res?.success) {
          Swal.fire({
            title: "Assigned!",
            text: "Customer has been assigned to the employee.",
            icon: "success"
          });
          this.router.navigate(['/admin/user/list']);
        }
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: "Please select an employee to assign.",
        icon: "error"
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/list']);
  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('generalInfoData');
  }
}