import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminAPI } from '../../../../../services/api-enum/api.enum';
import { AuthService } from '../../../../../services/auth.service';
import { CommonService } from '../../../../../services/common.service';

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
    { field: 'email', title: 'Email' },
    { field: 'city', title: 'City' },
    { field: 'role', title: 'Role' },
    { field: 'actions', title: 'Actions', sort: false, headerClass: 'justify-center' },
  ];
  items = [];
  params = {
    current_page: 1,
    pagesize: 10,
    keyword: '',
  };
  timer: any;
  loading: boolean = true;
  total_rows: number = 0;

  constructor(private commonService: CommonService, private router: Router, public auth: AuthService) { }

  ngOnInit() {
    this.getAllEmployee();
  }

  getAllEmployee(page?) {
    this.loading = true;
    this.commonService.postRequest(this.params, AdminAPI.get_all_employeee).subscribe((res: any) => {
      if (res) {
        this.items = res?.employees;
        this.total_rows = res?.pagination?.total;
        this.loading = false;
      }
    })
  }

  filterUsers() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.getAllEmployee();
    }, 300);
  }

  changeServer(data: any) {
    this.params.current_page = data.current_page;
    this.params.pagesize = data.pagesize;
    this.params.keyword = data.search;

    if (data.change_type === 'search') {
      this.filterUsers();
    } else {
      this.getAllEmployee();
    }
  }

  editEmployee(employee: any = null) {
    if (employee) {
      sessionStorage.setItem('generalInfoData', JSON.stringify(employee));
    } else {
      sessionStorage.removeItem('generalInfoData');
    }
    this.router.navigate(['/admin/employee/create']);
  }

  createInvoice(employee: any = null) {
    sessionStorage.setItem('userInvoiceData', JSON.stringify(employee));
    this.router.navigate(['/admin/invoice/create']);
  }

  deleteEmployee(id: any = null) {
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
        this.commonService.deleteRequest(AdminAPI.employee, id).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Deleted!",
              text: "Employee has been deleted.",
              icon: "success"
            });
            this.params.current_page = 1;
            this.getAllEmployee();
          }
        });
      }
    });
  }

}