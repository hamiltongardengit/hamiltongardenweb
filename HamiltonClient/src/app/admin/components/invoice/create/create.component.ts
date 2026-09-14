import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../../services/common.service';
import { AdminAPI } from '../../../../../services/api-enum/api.enum';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  invoiceForm: FormGroup;
  subtotal: number = 0;
  totalTaxAmount: number = 0;
  discountAmount: number = 0;
  totalAmount: number = 0;
  paidAmount: number = 0;
  isSubmitForm: boolean = false;
  invoiceId: any;
  todayDate: string;

  constructor(private fb: FormBuilder, private commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
    this.todayDate = new Date().toISOString().split('T')[0];
    const storedInvoiceData = sessionStorage.getItem('invoiceData');
    const userInvoiceData = sessionStorage.getItem('userInvoiceData');

    if (storedInvoiceData) {
      try {
        const invoice = JSON.parse(storedInvoiceData);
        if (invoice.invoiceNumber) {
          this.invoiceId = invoice._id;
        }
        if (invoice.invoiceDate) {
          invoice.invoiceDate = new Date(invoice.invoiceDate).toISOString().split('T')[0];
        }
        this.populateForm(invoice);
      } catch (error) {
        console.error('Error parsing invoice data:', error);
        sessionStorage.removeItem('invoiceData');
      }
    } else if (userInvoiceData) {
      try {
        const invoice = JSON.parse(userInvoiceData);
        this.populateForm(invoice, true);
      } catch (error) {
        console.error('Error parsing invoice data:', error);
        sessionStorage.removeItem('userInvoiceData');
      }
    } else {
      this.initForm();
    }
  }

  initForm() {
    this.invoiceForm = this.fb.group({
      invoiceDate: [this.todayDate, Validators.required],
      membershipNumber: [''],
      invoiceType: ['Invoice', Validators.required],
      customer: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        address: ['', Validators.required],
        contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
      }),
      items: this.fb.array([]),
      taxRate: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
      discountRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      paidAmount: [0, Validators.min(0)],
      paymentMethod: ['Credit/Debit Card', Validators.required],
      paymentStatus: ['Paid', Validators.required],
      notes: [''],
    });

    this.addItem(); // Initialize with one item
    this.calculateTotals(); // Calculate totals when the form is initialized
  }

  populateForm(invoice, type?): void {
    if (type) {
      this.invoiceForm = this.fb.group({
        invoiceDate: [this.todayDate, Validators.required],
        membershipNumber: [invoice.membershipNumber],
        invoiceType: ['Invoice', Validators.required],
        customer: this.fb.group({
          name: [invoice.firstname + ' ' + invoice.lastname, [Validators.required, Validators.minLength(3)]],
          email: [invoice.email, [Validators.required, Validators.email]],
          address: [invoice.address, Validators.required],
          contactNumber: [invoice.contactNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]]
        }),
        items: this.fb.array([]),
        taxRate: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
        discountRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        paidAmount: [0, Validators.min(0)],
        paymentMethod: ['Credit/Debit Card', Validators.required],
        paymentStatus: ['Paid', Validators.required],
        notes: [''],
      });
      this.addItem(); // Initialize with one item
      this.calculateTotals(); // Calculate totals when the form is initialized
    } else {
      this.invoiceForm = this.fb.group({
        invoiceDate: [invoice.invoiceDate, Validators.required],
        membershipNumber: [invoice.membershipNumber],
        invoiceType: [invoice.invoiceType, Validators.required],
        customer: this.fb.group({
          name: [invoice.customer.name, [Validators.required, Validators.minLength(3)]],
          email: [invoice.customer.email, [Validators.required, Validators.email]],
          address: [invoice.customer.address, Validators.required],
          contactNumber: [invoice.customer.contactNumber, [Validators.required, Validators.pattern('^[0-9]{10}$')]]
        }),
        items: this.fb.array(invoice.items.map(item => this.fb.group({
          service: [item.service, Validators.required],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          price: [item.price, [Validators.required, Validators.min(1)]],
          taxAmount: [{ value: item.taxAmount, disabled: true }],
          subtotal: [{ value: item.subtotal, disabled: true }]
        }))),
        taxRate: [invoice.taxRate, [Validators.required, Validators.min(0), Validators.max(100)]],
        discountRate: [invoice.discountRate, [Validators.required, Validators.min(0), Validators.max(100)]],
        paidAmount: [invoice.paidAmount, Validators.min(0)],
        paymentStatus: [invoice.paymentStatus, Validators.required],
        paymentMethod: [invoice.paymentMethod, Validators.required],
        notes: [invoice.notes],
      });

      this.calculateTotals(); // Recalculate totals based on the pre-filled data
    }
    
  }

  getItems(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    const item = this.fb.group({
      service: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(1)]],
      taxAmount: [{ value: 0, disabled: true }],
      subtotal: [{ value: 0, disabled: true }]
    });
    this.getItems().push(item);
  }

  removeItem(index: number): void {
    this.getItems().removeAt(index);
    this.calculateTotals(); // Recalculate totals when an item is removed
  }

  calculateTotals(): void {
    let subtotal = 0;
    let totalTaxAmount = 0;
    let discountAmount = 0;
    const taxRate = this.invoiceForm.get('taxRate').value || 0;
    const discountRate = this.invoiceForm.get('discountRate').value || 0;

    this.getItems().controls.forEach(item => {
      const quantity = item.get('quantity').value || 0;
      const price = item.get('price').value || 0;
      const tax = (price * quantity * taxRate) / 100;
      const total = (price * quantity) + tax;

      subtotal += price * quantity;
      totalTaxAmount += tax;
      discountAmount += (total * discountRate) / 100;
      item.get('taxAmount').setValue(tax);
      item.get('subtotal').setValue(total);
    });

    const totalAmount = subtotal + totalTaxAmount - discountAmount;
    this.subtotal = subtotal;
    this.totalTaxAmount = totalTaxAmount;
    this.discountAmount = discountAmount;
    this.totalAmount = totalAmount;
    this.invoiceForm.get('paidAmount').setValue(this.totalAmount);
    this.paidAmount = this.invoiceForm.get('paidAmount').value || 0;
  }

  updateInvoice(): void {
    this.isSubmitForm = true;
    if (this.invoiceForm.valid) {
      const invoiceData = this.invoiceForm.getRawValue();
      // Adding the additional keys to invoiceData
      invoiceData.subtotal = this.subtotal;
      invoiceData.totalTaxAmount = this.totalTaxAmount;
      invoiceData.discountAmount = this.discountAmount;
      invoiceData.totalAmount = this.totalAmount;

      if (this.invoiceId) {
        // Update existing invoice
        this.commonService.putRequest(invoiceData, AdminAPI.invoices, this.invoiceId).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Updated!",
              text: `Your Invoice HMGIS/INV/${ res?.invoice?.invoiceNumber } has been updated.`,
              icon: "success"
            });
            this.router.navigate(['/admin/invoice/list']);
          }
        });
      } else {
        // Create new invoice
        this.commonService.postRequest(invoiceData, AdminAPI.invoices).subscribe((res: any) => {
          if (res?.success) {
            Swal.fire({
              title: "Created!",
              text: `Your Invoice HMGIS/INV/${ res?.invoice?.invoiceNumber } has been created.`,
              icon: "success"
            });
            this.router.navigate(['/admin/invoice/list']);
          }
        });
      }
    } else {
      this.invoiceForm.markAllAsTouched();
    }
  }
  cancel(): void {
    this.router.navigate(['/admin/invoice/list']);
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('invoiceData');
    sessionStorage.removeItem('userInvoiceData');
  }

}
