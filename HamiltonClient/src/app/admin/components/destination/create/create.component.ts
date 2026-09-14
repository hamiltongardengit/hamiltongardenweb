import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminAPI } from '../../../../../services/api-enum/api.enum';
import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  destinationForm: FormGroup;
  isSubmitForm: boolean = false;
  isEditMode: boolean = false;
  destinationId: any;
  imagePreviews: string[] = [];
  selectedImages = [];
  removedImages = [];

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService) { }

  ngOnInit(): void {
    const storedDestinationData = sessionStorage.getItem('destinationData');

    if (storedDestinationData) {
      try {
        const destination = JSON.parse(storedDestinationData);
        if (destination._id) {
          this.destinationId = destination._id;
        }
        this.populateForm(destination);
      } catch (error) {
        console.error('Error parsing destination data:', error);
        sessionStorage.removeItem('destinationData');
      }
    } else {
      this.initForm();
    }
  }

  initForm() {
    this.destinationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['Domestic', Validators.required],
      images: [null]
    });
  }

  onImageChange(event: any) {
    const files: File[] = Array.from(event.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImages.push(file);
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    const removedImage = this.selectedImages[index]?.public_id;

    if (typeof removedImage === 'string') {
      // This is an existing image URL, not a new file
      this.removedImages.push(removedImage);
    }

    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  populateForm(destination): void {
    this.destinationForm = this.fb.group({
      name: [destination?.name, [Validators.required, Validators.minLength(2)]],
      location: [destination?.location, [Validators.required]],
      description: [destination?.description, [Validators.required]],
      category: [destination?.category, Validators.required],
      images: [],
    });
    destination?.images.forEach(image => {
      this.imagePreviews.push(image?.url);
      this.selectedImages.push(image);
    });
  }

  onSave(): void {
    this.isSubmitForm = true;
    if (this.destinationForm.valid) {
      const formData = new FormData();
      formData.append('name', this.destinationForm.get('name').value);
      formData.append('location', this.destinationForm.get('location').value);
      formData.append('description', this.destinationForm.get('description').value);
      formData.append('category', this.destinationForm.get('category').value);

      // Add new images
      this.selectedImages.forEach((file, index) => {
        if (file instanceof File) {  // Only append if it's a new file
          formData.append('images', file, file.name);
        }
      });

      // Append removed image URLs if there are any
      if (this.removedImages.length > 0) {
        formData.append('removedImages', JSON.stringify(this.removedImages));
      }

      if (this.destinationId) {
        this.commonService.putFormData(formData, AdminAPI.create_destination, this.destinationId).subscribe((res: any) => {
          if (res?.body?.success) {
            Swal.fire({
              title: "Updated!",
              text: "Destination Details has been updated.",
              icon: "success"
            });
            this.router.navigate(['/admin/destination/list']);
          }
        });
      } else {
        this.commonService.postFormData(formData, AdminAPI.create_destination).subscribe((res: any) => {
          if (res?.body?.success) {
            Swal.fire({
              title: "Created!",
              text: "Destination has been created.",
              icon: "success"
            });
            this.router.navigate(['/admin/destination/list']);
          }
        });
      }
    } else {
      this.destinationForm.markAllAsTouched();
    }
  }


  onCancel(): void {
    this.router.navigate(['/admin/destination/list']);
  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('destinationData');
  }
}