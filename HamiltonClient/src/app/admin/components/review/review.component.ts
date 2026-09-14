import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminAPI } from '../../../../services/api-enum/api.enum';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  @ViewChild('datatable') datatable: any;
  search = '';
  cols = [];
  items = [];
  params = {
    current_page: 1,
    pagesize: 10,
    keyword: '',
    status: 'pending',
  };
  timer: any;
  loading: boolean = true;
  total_rows: number = 0;

  constructor(private commonService: CommonService, private router: Router) { }

  ngOnInit() {
    this.cols = this.getColumns();
    this.getAllDestinations();
  }

  getColumns() {
    const baseColumns = [
      { field: 'destinationName', title: 'Destination' },
      { field: 'createdBy', title: 'Submitted by' },
      { field: 'createdAt', title: 'Submitted At' },
      { field: 'rating', title: 'Ratings' },
      { field: 'comment', title: 'Comment' },
    ];

    if (this.params.status === 'pending') {
      return [...baseColumns, { field: 'actions', title: 'Actions', sort: false, headerClass: 'justify-center' }];
    } else {
      return baseColumns;
    }
  }


  getAllDestinations(page?) {
    this.loading = true;
    this.commonService.postRequest(this.params, AdminAPI.get_reviews_by_status).subscribe((res: any) => {
      if (res) {
        this.items = res?.reviews;
        this.total_rows = res?.pagination?.total;
        this.loading = false;
      }
    })
  }

  filterDestinations() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.getAllDestinations();
    }, 300);
  }

  changeServer(data: any) {
    this.params.current_page = data.current_page || 1;
    this.params.pagesize = data.pagesize || 10;
    this.params.keyword = data.search || '';
    this.cols = this.getColumns();

    if (data.change_type === 'search') {
      this.filterDestinations();
    } else {
      this.getAllDestinations();
    }
  }

  updateReviewStatus(review, type) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: type == 'approved' ? "Yes, Approve it!" : "Yes, Reject it!"
    }).then((result) => {
      if (result.isConfirmed) {
        const request = {
          "reviewId": review?._id,
          "destinationId": review?.destinationId,
          "status": type
        }
        
        this.commonService.putRequest(request, AdminAPI.update_review_status).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Status Updated!",
              text: res?.message,
              icon: "success"
            });
            this.params.current_page = 1;
            this.cols = this.getColumns();
            this.getAllDestinations();
          }
        });
      }
    });
  }

}