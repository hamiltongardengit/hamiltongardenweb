import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminAPI } from '../../../../services/api-enum/api.enum';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-membership-enquiries',
  templateUrl: './membership-enquiries.component.html',
  styleUrls: ['./membership-enquiries.component.css']
})
export class MembershipEnquiriesComponent implements OnInit {
@ViewChild('datatable') datatable: any;
  search = '';
  cols = [];
  items = [];
  params = {
    current_page: 1,
    pagesize: 10,
    keyword: '',
  };
  timer: any;
  loading: boolean = true;
  total_rows: number = 0;

  constructor(private commonService: CommonService, private router: Router) { }

  ngOnInit() {
    this.cols = this.getColumns();
    this.getAllEnquiries();
  }

  getColumns() {
    const baseColumns = [
      { field: 'name', title: 'Name' },
      { field: 'email', title: 'Email' },
      { field: 'mobile', title: 'Mobile No.' },
      { field: 'currentCity', title: 'City' },
      { field: 'age', title: 'Age' },
      { field: 'message', title: 'Message' },
    ];
    return baseColumns;
  }


  getAllEnquiries(page?) {
    this.loading = true;
    this.commonService.postRequest(this.params, AdminAPI.get_all_enquiries).subscribe((res: any) => {
      if (res) {
        this.items = res?.enquiries;
        this.total_rows = res?.pagination?.total;
        this.loading = false;
      }
    })
  }

  filterEnquiries() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.getAllEnquiries();
    }, 300);
  }

  changeServer(data: any) {
    this.params.current_page = data.current_page || 1;
    this.params.pagesize = data.pagesize || 10;
    this.params.keyword = data.search || '';
    this.cols = this.getColumns();

    if (data.change_type === 'search') {
      this.filterEnquiries();
    } else {
      this.getAllEnquiries();
    }
  }

}