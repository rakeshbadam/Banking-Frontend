import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent {

  customers: any[] = [];
  searchId!: number;

  nextCursor: number | null = null;
  hasNext = true;
  loading = false;

  showForm = false;
  editMode = false;

  customerForm: any = {
    customerId: null,
    customerName: '',
    email: '',
    income: null,
    phoneNumber: ''
  };

  private baseUrl = 'http://18.233.219.222:8080/api/customers';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCustomers();
  }

  // ================= DEFAULT CURSOR LOAD =================
  loadCustomers() {

    if (!this.hasNext || this.loading) return;

    this.loading = true;

    let url = `${this.baseUrl}/cursor`;

    if (this.nextCursor !== null) {
      url += `?cursor=${this.nextCursor}`;
    }

    this.http.get<any>(url)
      .subscribe({
        next: res => {

          const data = res.data || res;

          if (!data || data.length === 0) {
            this.hasNext = false;
            this.loading = false;
            return;
          }

          this.customers = [...this.customers, ...data];
          this.nextCursor = data[data.length - 1].customerId;

          this.loading = false;
        },
        error: err => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  // ================= SEARCH BY ID =================
  searchCustomer() {

    if (!this.searchId) return;

    this.http.get<any>(`${this.baseUrl}/${this.searchId}`)
      .subscribe({
        next: res => {
          this.customers = [res];
          this.hasNext = false;
        },
        error: err => {
          alert('Customer not found');
        }
      });
  }

  // ================= RESET SEARCH =================
  resetSearch() {
    this.customers = [];
    this.nextCursor = null;
    this.hasNext = true;
    this.loadCustomers();
  }

  // ================= ADD =================
  openAddForm() {
    this.showForm = true;
    this.editMode = false;

    this.customerForm = {
      customerId: null,
      customerName: '',
      email: '',
      income: null,
      phoneNumber: ''
    };
  }

  // ================= EDIT =================
  openEditForm(customer: any) {
    this.showForm = true;
    this.editMode = true;
    this.customerForm = { ...customer };
  }

  // ================= SAVE (POST / PUT) =================
  saveCustomer() {

    if (this.editMode) {

      this.http.put(
        `${this.baseUrl}/${this.customerForm.customerId}`,
        this.customerForm
      ).subscribe({
        next: () => {
          this.afterSave();
        }
      });

    } else {

      this.http.post(
        this.baseUrl,
        this.customerForm
      ).subscribe({
        next: () => {
          this.afterSave();
        }
      });
    }
  }

  afterSave() {
    this.showForm = false;
    this.resetSearch();
  }

  cancel() {
    this.showForm = false;
  }

}