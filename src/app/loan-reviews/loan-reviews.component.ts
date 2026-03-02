import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface LoanRequestRow {
  id: number;
  customerId: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: string;
  processedAt?: string;
  filePath: string;
}

@Component({
  selector: 'app-loan-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-reviews.component.html',
  styleUrls: ['./loan-reviews.component.css']
})
export class LoanReviewsComponent implements OnInit {

  private readonly BASE = 'http://18.233.219.222:8080';
  private readonly S3_BUCKET = 'banking-analytics-export';

  reviewerName: string = 'Rakesh';

  successLoans: LoanRequestRow[] = [];
  reviewQueue: LoanRequestRow[] = [];

  approvedList: any[] = [];
  rejectedList: any[] = [];
  escalatedList: any[] = [];

  activeLoanId: number | null = null;
  activeAction: 'APPROVED' | 'REJECTED' | 'ESCALATED' | null = null;
  actionReason: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.loadSuccessLoans();
    this.loadQueue();
    this.loadApproved();
    this.loadRejected();
    this.loadEscalated();
  }

  loadSuccessLoans(): void {
    this.http.get<LoanRequestRow[]>(`${this.BASE}/api/loan-request/status/SUCCESS`)
      .subscribe(res => this.successLoans = Array.isArray(res) ? res : []);
  }

  loadQueue(): void {
    this.http.get<{ data: LoanRequestRow[] }>(`${this.BASE}/api/loan-review/queue`)
      .subscribe(res => this.reviewQueue = res?.data ?? []);
  }

  loadApproved(): void {
    this.http.get<any>(`${this.BASE}/api/loan-review?decision=APPROVED`)
      .subscribe(res => this.approvedList = res?.data ?? []);
  }

  loadRejected(): void {
    this.http.get<any>(`${this.BASE}/api/loan-review?decision=REJECTED`)
      .subscribe(res => this.rejectedList = res?.data ?? []);
  }

  loadEscalated(): void {
    this.http.get<any>(`${this.BASE}/api/loan-review?decision=ESCALATED`)
      .subscribe(res => this.escalatedList = res?.data ?? []);
  }

  startReview(id: number): void {
    const url = `${this.BASE}/api/loan-review/${id}/start?reviewerName=${this.reviewerName}`;
    this.http.post(url, {}).subscribe(() => this.refreshAll());
  }

  openAction(id: number, action: any): void {
    this.activeLoanId = id;
    this.activeAction = action;
    this.actionReason = '';
  }

  cancelAction(): void {
    this.activeLoanId = null;
    this.activeAction = null;
    this.actionReason = '';
  }

  submitAction(id: number): void {
    if (!this.reviewerName.trim()) {
      alert('Reviewer name required');
      return;
    }

    if ((this.activeAction === 'REJECTED' || this.activeAction === 'ESCALATED')
        && !this.actionReason.trim()) {
      alert('Reason required');
      return;
    }

    let url =
      `${this.BASE}/api/loan-review/${id}/decision` +
      `?reviewerName=${this.reviewerName}` +
      `&decision=${this.activeAction}`;

    if (this.activeAction === 'ESCALATED') {
      url += `&escalationReason=${this.actionReason}`;
    }

    if (this.activeAction === 'REJECTED') {
      url += `&notes=${this.actionReason}`;
    }

    if (this.activeAction === 'APPROVED' && this.actionReason.trim()) {
      url += `&notes=${this.actionReason}`;
    }

    this.http.post(url, {}).subscribe(() => {
      this.cancelAction();
      this.refreshAll();
    });
  }

  getS3Url(filePath: string): string {
    return filePath
      ? `https://${this.S3_BUCKET}.s3.amazonaws.com/${filePath}`
      : '';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    const dt = new Date(value);
    return dt.toLocaleString();
  }
}