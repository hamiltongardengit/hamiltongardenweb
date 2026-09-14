import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminAPI } from '../../../../../services/api-enum/api.enum';
import { CommonService } from '../../../../../services/common.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  @ViewChild('datatable') datatable: any;
  search = '';
  cols = [
    { field: 'name', title: 'Name' },
    { field: 'location', title: 'Location' },
    { field: 'ratings', title: 'Ratings' },
    { field: 'category', title: 'Category' },
    { field: 'actions', title: 'Actions', sort: false, headerClass: 'justify-center' },
  ];
  items = [];
  params = {
    current_page: 1,
    pagesize: 10,
    keyword: '',
    category: 'Domestic',
    location: '',
  };
  timer: any;
  loading: boolean = true;
  total_rows: number = 0;
  locations: any;

  constructor(private commonService: CommonService, private router: Router, public auth: AuthService) { }

  ngOnInit() {
    this.getAllDestinations();
  }

  getAllDestinations(page?) {
    this.loading = true;
    this.commonService.postRequest(this.params, AdminAPI.destinations).subscribe((res: any) => {
      if (res) {
        this.items = res?.destinations;
        this.locations = res?.locations;
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

  changeServer(data: any, type?) {
    if (type == 'category') this.params.location = "";
    this.params.current_page = data.current_page || 1;
    this.params.pagesize = data.pagesize || 10;
    this.params.keyword = data.search || '';

    if (data.change_type === 'search') {
      this.filterDestinations();
    } else {
      this.getAllDestinations();
    }
  }

  editDestination(destination: any = null) {
    if (destination) {
      sessionStorage.setItem('destinationData', JSON.stringify(destination));
    } else {
      sessionStorage.removeItem('destinationData');
    }
    this.router.navigate(['/admin/destination/create']);
  }

  deleteDestination(id: any = null) {
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
        this.commonService.deleteRequest(AdminAPI.create_destination, id).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Deleted!",
              text: "Destination has been deleted.",
              icon: "success"
            });
            this.params.current_page = 1;
            this.getAllDestinations();
          }
        });
      }
    });
  }

}