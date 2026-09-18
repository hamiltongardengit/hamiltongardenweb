import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminAPI } from '../../../../../services/api-enum/api.enum';
import { AuthService } from '../../../../../services/auth.service';
import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css', '../../customer/create/create.component.css']
})
export class CreateComponent implements OnInit {
  activeTab = 'home';
  generalInfoForm: FormGroup;
  isSubmitForm: boolean = false;
  isEditMode: boolean = false;
  userId: any;
  showPassword: boolean = false;
  todayDate: string;
  
  availableRoles = [
    { value: 'employee', label: 'Employee' },
    { value: 'employee_view', label: 'Employee View Only' },
  ];
  selectedRoles: string[] = [];
  @ViewChild('datatable') datatable: any;
  cols = [
    { field: 'firstname', title: 'Firstname' },
    { field: 'lastname', title: 'Lastname' },
    { field: 'email', title: 'Email' },
    { field: 'contactNumber', title: 'Contact Number' },
  ];
  items = [];
  params = {
    current_page: 1,
    pagesize: 10,
    keyword: '',
    userId: '',
  };
  loading: boolean = true;
  payoutCols = [
    { field: 'periodStart', title: 'Period Start' },
    { field: 'periodEnd', title: 'Period End' },
    { field: 'baseSalary', title: 'Base Salary' },
    { field: 'commissionValue', title: 'Commission' },
    { field: 'totalPayout', title: 'Total Payout' },
    { field: 'status', title: 'Status' },
  ];
  payoutItems = [];
  payoutLoading: boolean = true;
  imagePreviews: string[] = [];
  selectedImages = [];
  removedImages = [];
  docData: any;

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService, private auth: AuthService) { }

  ngOnInit(): void {
    const storedUserData = sessionStorage.getItem('generalInfoData');
    this.todayDate = new Date().toISOString().split('T')[0];

    // Filter available roles based on logged-in user
    if (!this.auth.getUserRole()?.includes('super_admin')) {
      this.availableRoles = this.availableRoles.filter(role => 
        role.value === 'employee' || role.value === 'employee_view'
      );
    }

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

  initForm() {
    this.generalInfoForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roles: [[], Validators.required],
      address: ['', [Validators.required, Validators.minLength(6)]],
      city: ['', Validators.required],
      birthdate: ['', Validators.required],
      anniversaryDate: [''],
      dateOfJoining: [this.todayDate, Validators.required],
      employmentType: ['ps'],
      salaryStructure: [0, [Validators.required, Validators.min(0)]],
      commissionRate: [2, [Validators.required, Validators.min(0)]],
    });
  }

  populateForm(user): void {
    this.generalInfoForm = this.fb.group({
      firstname: [user?.firstname, [Validators.required, Validators.minLength(2)]],
      lastname: [user?.lastname, [Validators.required, Validators.minLength(2)]],
      email: [user?.email, [Validators.required, Validators.email]],
      contactNumber: [user?.contactNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.minLength(8)]],
      roles: [user?.roles || [], Validators.required],
      address: [user?.address, [Validators.required, Validators.minLength(6)]],
      city: [user?.city, Validators.required],
      birthdate: [user?.birthdate ? new Date(user?.birthdate).toISOString().split('T')[0] : '', Validators.required],
      anniversaryDate: [user?.anniversaryDate ? new Date(user?.anniversaryDate).toISOString().split('T')[0] : ''],
      dateOfJoining: [user?.dateOfJoining, Validators.required],
      employmentType: [user?.employmentType],
      salaryStructure: [user?.salaryStructure, [Validators.required, Validators.min(0)]],
      commissionRate: [user?.commissionRate, [Validators.required, Validators.min(0)]],
    });
    this.items = user?.linkedCustomers || [];
    this.selectedRoles = user?.roles || [];
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
        this.commonService.putRequest(formData, AdminAPI.employee, this.userId).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Updated!",
              text: "Employee Details has been updated.",
              icon: "success"
            });
            this.router.navigate(['/admin/employee/list']);
          }
        });
      } else {
        this.commonService.postRequest(formData, AdminAPI.create_employee).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Created!",
              text: "Employee has been created.",
              icon: "success"
            });
            this.router.navigate(['/admin/employee/list']);
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
      this.deleteAgreement(this.docData?.public_id, index);
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
            text: "Supporting Offer Letter has been uploaded.",
            icon: "success"
          });
          this.router.navigate(['/admin/employee/list']);
        }
      });
    }
  }

  deleteAgreement(id: any = null, index) {
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
              text: "Employee Supporting Offer Letter has been deleted.",
              icon: "success"
            });
            const removedImage = this.selectedImages[index]?.public_id;
            if (typeof removedImage === 'string') {
              this.removedImages.push(removedImage);
            }
            this.selectedImages.splice(index, 1);
            this.imagePreviews.splice(index, 1);
            this.router.navigate(['/admin/employee/list']);
          }
        });
      }
    });
  }

  onRoleChange(event: any): void {
    const value = event.target.value;
    const checked = event.target.checked;
    const currentRoles = this.generalInfoForm.get('roles')?.value || [];
    
    if (checked) {
      this.generalInfoForm.patchValue({ roles: [...currentRoles, value] });
    } else {
      this.generalInfoForm.patchValue({ roles: currentRoles.filter(r => r !== value) });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/employee/list']);
  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('generalInfoData');
  }
}