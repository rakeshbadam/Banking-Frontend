// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

/* ✅ ADDED — Interface (DO NOT REMOVE) */
export interface LoanRequest {
  id: number;

  // Existing fields (from normal loan APIs)
  customerId?: number;
  filePath?: string;
  createdAt?: string;
  processedAt?: string;

  // Processing & Non-existing APIs
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
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private readonly BASE = 'http://18.233.219.222:8080';

  allRequests: LoanRequest[] = [];
  requests: LoanRequest[] = [];
  currentStatus: string = 'ALL';
  loading: boolean = false;

  selectedCustomerId: number | null = null;
  dti: number | null = null;
  creditUtilization: number | null = null;
  dtiRisk: string | null = null;
  creditRisk: string | null = null;
  analyticsLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllRequests();
  }

  fetchAllRequests(): void {
    this.loading = true;

    forkJoin({
      // Existing loan request APIs
      pending: this.http.get<LoanRequest[]>(`${this.BASE}/api/loan-request/pending`),
      success: this.http.get<LoanRequest[]>(`${this.BASE}/api/loan-request/status/SUCCESS`),
      failed:  this.http.get<LoanRequest[]>(`${this.BASE}/api/loan-request/status/FAILED`),

      // ✅ ADD THIS — Non-existing pending API
      pendingNonExisting: this.http.get<any[]>(
        `${this.BASE}/api/non-existing-loan-applications/pending`
      ),

      // Existing processing API
      processing: this.http.get<any[]>(
        `${this.BASE}/api/non-existing-loan-applications/status/PROCESSING`
      )
    }).subscribe({
      next: ({ pending, success, failed, pendingNonExisting, processing }) => {

        // 🔥 Map non-existing pending into LoanRequest format
        const mappedPendingNonExisting: LoanRequest[] = pendingNonExisting.map(p => ({
          id: p.id,
          name: p.name,
          income: p.income,
          phoneNumber: p.phoneNumber,
          status: p.status,
          createdTime: p.createdTime,
          modifiedTime: p.modifiedTime
        }));

        // 🔥 Map processing into LoanRequest format
        const mappedProcessing: LoanRequest[] = processing.map(p => ({
          id: p.id,
          name: p.name,
          income: p.income,
          phoneNumber: p.phoneNumber,
          status: p.status,
          createdTime: p.createdTime,
          modifiedTime: p.modifiedTime
        }));

        // ✅ Combine everything
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
      error: (err) => {
        console.error('Failed to load loan requests', err);
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
      this.requests = this.allRequests.filter(
        r => r.status === this.currentStatus
      );
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

  loadAnalytics(customerId: number): void {
    this.selectedCustomerId = customerId;
    this.analyticsLoading = true;
    this.dti = null;
    this.creditUtilization = null;
    this.dtiRisk = null;
    this.creditRisk = null;

    forkJoin({
      dti: this.http.get<any>(`${this.BASE}/api/analytics/customer/${customerId}/dti`),
      creditUtilization: this.http.get<any>(`${this.BASE}/api/analytics/customer/${customerId}/credit-utilization`)
    }).subscribe({
      next: ({ dti, creditUtilization }) => {
        this.dti = dti.value;
        this.creditUtilization = creditUtilization.value;
        this.dtiRisk = dti.riskCategory;
        this.creditRisk = creditUtilization.riskCategory;
        this.analyticsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load analytics', err);
        this.analyticsLoading = false;
      }
    });
  }
}