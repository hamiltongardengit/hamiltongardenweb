import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminAPI } from '../../../../../services/api-enum/api.enum';
import { CommonService } from '../../../../../services/common.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
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
    { field: 'invoiceNumber', title: 'Invoice' },
    { field: 'name', title: 'Name' },
    { field: 'email', title: 'Email' },
    { field: 'invoiceDate', title: 'Date' },
    { field: 'totalAmount', title: 'Amount', headerClass: 'justify-end' },
    { field: 'paymentStatus', title: 'Status' },
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
    this.getAllInvoices();
  }

  getAllInvoices(page?) {
    this.loading = true;
    this.commonService.postRequest(this.params, AdminAPI.get_all_invoices).subscribe((res : any) => {
      if (res) {
        this.items = res?.invoices;
        this.total_rows = res?.pagination?.total;
        this.loading = false;
      }
    })
  }
  processInvoices() {
    this.loading = true;
    this.commonService.getRequest(AdminAPI.process_invoices).subscribe((res: any) => {
      if (res?.success) {
        this.loading = false;
        Swal.fire({
          title: "Processed!",
          text: "Invoice has been processed successfully.",
          icon: "success"
        });
        this.getAllInvoices();
      }
    })
  }

  filterUsers() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.getAllInvoices();
    }, 300);
  }

  changeServer(data: any) {
    this.params.current_page = data.current_page;
    this.params.pagesize = data.pagesize;
    this.params.keyword = data.search;

    if (data.change_type === 'search') {
      this.filterUsers();
    } else {
      this.getAllInvoices();
    }
  }

  editInvoice(invoice: any = null) {
    if (invoice) {
      sessionStorage.setItem('invoiceData', JSON.stringify(invoice));
    } else {
      sessionStorage.removeItem('invoiceData');
    }
    this.router.navigate(['/admin/invoice/create']);
  }

  downloadPDF(url: string, invoiceNumber: string) {
    const pdfName = `INV-#` + invoiceNumber + `.pdf`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', pdfName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  deleteRow(id: any = null) {
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
        this.commonService.deleteRequest(AdminAPI.invoices, id).subscribe((res:any) => {
          if (res?.success) {
            Swal.fire({
              title: "Deleted!",
              text: "Your Invoice has been deleted.",
              icon: "success"
            });
            this.params.current_page = 1;
            this.getAllInvoices();
          }
        });
      }
    });
  }

  exportInvoices(invoiceId?: string): void {
    let url: string = AdminAPI.export_invoices as unknown as string;
    if (invoiceId) {
      url += `?invoiceId=${invoiceId}`;
    }
    this.commonService.exportFile(url).subscribe({
      next: (blob: Blob) => {
        const fileName = `Invoices_${new Date().toISOString().split('T')[0]}.csv`; // Dynamic file name
        this.commonService.downloadFile(blob, fileName);
      },
      error: (error) => {
        console.error('Error exporting invoices:', error);
        alert('Failed to export invoices. Please try again.');
      }
    });
  }

}
