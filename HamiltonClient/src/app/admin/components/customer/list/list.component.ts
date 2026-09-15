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
    this.getAllUsers();
  }

  getAllUsers(page?) {
  this.loading = true;

  this.commonService
    .postRequest(this.params, AdminAPI.get_all_users)
    .subscribe({
      next: (res: any) => {
        if (res) {
          this.items = (res?.users || []).map((user: any) => ({
            ...user,
            role: Array.isArray(user.role)
              ? user.role[0]
              : user.role ||
                (Array.isArray(user.roles) ? user.roles[0] : user.roles) ||
                'user'
          }));

          this.total_rows = res?.pagination?.total || 0;
        }

        this.loading = false;
      },

      error: (err) => {
        console.error('Get users error:', err);
        this.loading = false;
      }
    });
}

  filterUsers() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.getAllUsers();
    }, 300);
  }

  changeServer(data: any) {
    this.params.current_page = data.current_page;
    this.params.pagesize = data.pagesize;
    this.params.keyword = data.search;

    if (data.change_type === 'search') {
      this.filterUsers();
    } else {
      this.getAllUsers();
    }
  }

  editUser(user: any = null) {
    if (user) {
      sessionStorage.setItem('generalInfoData', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('generalInfoData');
    }
    this.router.navigate(['/admin/user/create']);
  }

  createInvoice(user: any = null) {
    sessionStorage.setItem('userInvoiceData', JSON.stringify(user));
    this.router.navigate(['/admin/invoice/create']);
  }

  deleteUser(id: any = null) {
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
        this.commonService.deleteRequest(AdminAPI.user, id).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Deleted!",
              text: "User has been deleted.",
              icon: "success"
            });
            this.params.current_page = 1;
            this.getAllUsers();
          }
        });
      }
    });
  }

}

