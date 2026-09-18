import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminAPI } from '../../../../../services/api-enum/api.enum';
import { AuthService } from '../../../../../services/auth.service';
import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'app-membership-expiring-report',
  templateUrl: './membership-expiring-report.component.html',
  styleUrls: ['./membership-expiring-report.component.css']
})
export class MembershipExpiringReportComponent implements OnInit {
  @ViewChild('datatable') datatable: any;
  search = '';
  cols = [
    // { field: 'invoiceNumber', title: 'Invoice' },
    { field: 'name', title: 'Name' },
    { field: 'email', title: 'Email' },
    { field: 'contactNumber', title: 'Contact Number' },
    { field: 'startDate', title: 'Start Date' },
    { field: 'expiryDate', title: 'Expiry Date' },
    { field: 'status', title: 'Status' },
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

  constructor(private commonService: CommonService, public auth: AuthService) { }

  ngOnInit() {
    this.getExpiringMemberships();
  }

  getExpiringMemberships(page?) {
    this.loading = true;
    this.commonService.postRequest(this.params, AdminAPI.get_expiring_memberships).subscribe((res: any) => {
      if (res) {
        this.items = res?.invoices;
        this.total_rows = res?.pagination?.total;
        this.loading = false;
      }
    })
  }
  filterUsers() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.getExpiringMemberships();
    }, 300);
  }

  changeServer(data: any) {
    this.params.current_page = data.current_page;
    this.params.pagesize = data.pagesize;
    this.params.keyword = data.search;

    if (data.change_type === 'search') {
      this.filterUsers();
    } else {
      this.getExpiringMemberships();
    }
  }

  getExpiryClass(expiryDate: string | Date): string {
    const now = new Date();
    const exp = new Date(expiryDate);
    const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      return 'badge-outline-secondary'; // Already expired
    } else if (diffDays <= 30) {
      return 'badge-outline-danger'; // Expiring soon
    }
    return 'badge-outline-success'; // Active
  }

  getExpiryText(expiryDate: string | Date): string {
    const now = new Date();
    const exp = new Date(expiryDate);
    const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays <= 30) {
      return 'Expiring soon';
    }
    return 'Active';
  }
  
}