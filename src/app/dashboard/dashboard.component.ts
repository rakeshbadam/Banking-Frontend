import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

export interface LoanRequest {
  id: number;
  customerId?: number;
  filePath?: string;
  createdAt?: string;
  processedAt?: string;
  name?: string;
  income?: number;
  phoneNumber?: string;
  createdTime?: string;
  modifiedTime?: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private readonly BASE = 'http://18.233.219.222:8080';

  allRequests: LoanRequest[] = [];
  requests: LoanRequest[] = [];
  currentStatus: string = 'ALL';
  loading: boolean = false;

  /* ================= NEW FORM FIELDS ================= */
  isExistingCustomer: boolean = true;
  newCustomerId!: number;
  newName!: string;
  newPhone!: string;
  newIncome!: number;
  formSuccess: string = '';
  formError: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllRequests();
  }

  /* ================= SUBMIT LOGIC ================= */
  submitLoanRequest(): void {

    this.formSuccess = '';
    this.formError = '';

    if (this.isExistingCustomer) {

      if (!this.newCustomerId) {
        this.formError = 'Customer ID is required';
        return;
      }

      this.http.post(`${this.BASE}/api/loan-request/${this.newCustomerId}`, {})
        .subscribe({
          next: () => {
            this.formSuccess = 'Loan request created successfully';
            this.fetchAllRequests();
          },
          error: (err) => {
            this.formError = err.error?.message || 'Failed to create loan request';
          }
        });

    } else {

      if (!this.newName || !this.newPhone || !this.newIncome) {
        this.formError = 'All fields are required';
        return;
      }

      const body = {
        name: this.newName,
        phoneNumber: this.newPhone,
        income: this.newIncome
      };

      this.http.post(`${this.BASE}/api/non-existing-loan-applications`, body)
        .subscribe({
          next: () => {
            this.formSuccess = 'Loan request created successfully';
            this.fetchAllRequests();
          },
          error: (err) => {
            this.formError = err.error?.message || 'Failed to create loan request';
          }
        });
    }
  }

  /* ================= DELETE AUTO-DETECT ================= */
  deleteRequest(r: LoanRequest): void {

    if (r.customerId !== undefined) {
      // existing
      this.http.delete(`${this.BASE}/api/loan-request/${r.id}`)
        .subscribe(() => this.fetchAllRequests());
    } else {
      // non-existing
      this.http.delete(`${this.BASE}/api/non-existing-loan-applications/${r.id}`)
        .subscribe(() => this.fetchAllRequests());
    }
  }

  /* ================= ORIGINAL METHODS UNCHANGED ================= */
  fetchAllRequests(): void {

    this.loading = true;

    forkJoin({
      pending: this.http.get<LoanRequest[]>(`${this.BASE}/api/loan-request/pending`),
      success: this.http.get<LoanRequest[]>(`${this.BASE}/api/loan-request/status/SUCCESS`),
      failed:  this.http.get<LoanRequest[]>(`${this.BASE}/api/loan-request/status/FAILED`),
      pendingNonExisting: this.http.get<any[]>(`${this.BASE}/api/non-existing-loan-applications/pending`),
      processing: this.http.get<any[]>(`${this.BASE}/api/non-existing-loan-applications/status/PROCESSING`)
    }).subscribe({
      next: ({ pending, success, failed, pendingNonExisting, processing }) => {

        const mappedPendingNonExisting: LoanRequest[] = pendingNonExisting.map(p => ({
          id: p.id,
          name: p.name,
          income: p.income,
          phoneNumber: p.phoneNumber,
          status: p.status,
          createdTime: p.createdTime,
          modifiedTime: p.modifiedTime
        }));

        const mappedProcessing: LoanRequest[] = processing.map(p => ({
          id: p.id,
          name: p.name,
          income: p.income,
          phoneNumber: p.phoneNumber,
          status: p.status,
          createdTime: p.createdTime,
          modifiedTime: p.modifiedTime
        }));

        this.allRequests = [
          ...pending,
          ...mappedPendingNonExisting,
          ...mappedProcessing,
          ...success,
          ...failed
        ];

        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setStatus(status: string): void {
    this.currentStatus = status;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentStatus === 'ALL') {
      this.requests = this.allRequests;
    } else {
      this.requests = this.allRequests.filter(r => r.status === this.currentStatus);
    }
  }

  getPendingCount(): number {
    return this.allRequests.filter(r => r.status === 'PENDING').length;
  }

  getProcessingCount(): number {
    return this.allRequests.filter(r => r.status === 'PROCESSING').length;
  }

  getSuccessCount(): number {
    return this.allRequests.filter(r => r.status === 'SUCCESS').length;
  }

  getFailedCount(): number {
    return this.allRequests.filter(r => r.status === 'FAILED').length;
  }
}