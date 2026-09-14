import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { API } from '../../../services/api-enum/api.enum';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-destination-detail',
  templateUrl: './destination-detail.component.html',
  styleUrls: ['./destination-detail.component.css']
})
export class DestinationDetailComponent implements OnInit {
  destination: any;
  reviewForm: FormGroup;
  rating = 0; // Holds the rating value from 1 to 5
  hoverRating = 0; // Holds temporary rating value for hover effect
  submitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private commonService: CommonService, public auth: AuthService) {
    this.reviewForm = this.fb.group({
      rating: [null, Validators.required], // Form control for rating with required validation
      comment: ['', Validators.required] // Form control for comment with required validation
    });
   }

  ngOnInit() {
    const storedDestinationData = sessionStorage.getItem('destinationData');

    if (storedDestinationData) {
        this.destination = JSON.parse(storedDestinationData);
    } else {
      sessionStorage.removeItem('destinationData');
      this.router.navigate(['/destinations/detail']);
    }
  }

  // Method to handle star hover
  hoverStar(rating: number): void {
    this.hoverRating = rating;
  }

  // Method to set rating on star click
  rateDestination(rating: number): void {
    this.rating = rating;
    this.reviewForm.patchValue({ rating }); // Update the rating form control
  }

  // Method to submit review
  submitReview(): void {
    this.submitted = true;
    if (this.reviewForm.valid) {
      this.submitted = false;
      // Proceed with review submission logic
      const reviewData = this.reviewForm.value;
      this.commonService.putRequest(reviewData, API.review, this.destination?._id).subscribe((res: any) => {
        if (res?.success) {
          Swal.fire({
            title: "Submitted!",
            text: "Your Review has been submitted.",
            icon: "success"
          });
          // Reset form fields after submission
          this.reviewForm.reset();
          this.rating = 0;
          this.hoverRating = 0;
        }
      });
    } else {
      // Show validation errors
      this.reviewForm.markAllAsTouched(); // To show validation messages
    }
    
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('destinationData');
  }

}
