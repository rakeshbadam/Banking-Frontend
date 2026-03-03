import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent {

  @ViewChild('weeklyChartCanvas') weeklyChartCanvas!: ElementRef;

  customerId!: number;

  dti: number | null = null;
  creditUtilization: number | null = null;
  riskCategory: string | null = null;

  weeklySummary: any[] = [];
  transactions: any[] = [];

  chart: any;

  searchKeyword: string = '';
  loading: boolean = false;
  analyticsLoaded: boolean = false;

  private analyticsBaseUrl = 'http://18.233.219.222:8080/api/analytics/customer';
  private transactionBaseUrl = 'http://18.233.219.222:8080/api/transactions';

  constructor(private http: HttpClient) {}

  // =========================================
  // FINAL STABLE LOAD METHOD
  // =========================================

  loadAnalytics() {

    if (!this.customerId) return;

    this.loading = true;
    this.analyticsLoaded = true;

    // Reset everything
    this.dti = null;
    this.creditUtilization = null;
    this.riskCategory = null;
    this.weeklySummary = [];
    this.transactions = [];

    if (this.chart) {
      this.chart.destroy();
    }

    let pendingRequests = 3;
    const markRequestDone = () => {
      pendingRequests -= 1;
      if (pendingRequests === 0) {
        this.loading = false;
      }
    };

    this.http.get<any>(`${this.analyticsBaseUrl}/${this.customerId}/dti`)
      .subscribe({
        next: res => {
          this.dti = res?.value ?? null;
          this.riskCategory = res?.riskCategory ?? null;
          markRequestDone();
        },
        error: err => {
          console.error('DTI Error:', err);
          markRequestDone();
        }
      });

    this.http.get<any>(`${this.analyticsBaseUrl}/${this.customerId}/credit-utilization`)
      .subscribe({
        next: res => {
          this.creditUtilization = res?.value ?? null;
          markRequestDone();
        },
        error: err => {
          console.error('CU Error:', err);
          markRequestDone();
        }
      });

    this.http.get<any[]>(`${this.analyticsBaseUrl}/${this.customerId}/weekly-summary`)
      .subscribe({
        next: res => {
          this.weeklySummary = res ?? [];
          setTimeout(() => {
            this.createChart();
          }, 100);
          markRequestDone();
        },
        error: err => {
          console.error('Weekly Error:', err);
          this.weeklySummary = [];
          markRequestDone();
        }
      });

    this.loadCustomerTransactions();
  }

  // =========================================
  // LOAD TRANSACTIONS
  // =========================================

  loadCustomerTransactions() {
    if (!this.customerId) return;

    this.http.get<any[]>(
      `${this.transactionBaseUrl}/customer/${this.customerId}`
    ).subscribe({
      next: res => {
        this.transactions = res ?? [];
      },
      error: err => {
        console.error('Transaction Load Error:', err);
        this.transactions = [];
      }
    });
  }

  // =========================================
  // SEARCH TRANSACTIONS
  // =========================================

  searchTransactions() {
    if (!this.customerId || !this.searchKeyword.trim()) {
      this.loadCustomerTransactions();
      return;
    }

    this.http.get<any[]>(
      `${this.transactionBaseUrl}/customer/${this.customerId}/search?keyword=${this.searchKeyword}`
    ).subscribe({
      next: res => {
        this.transactions = res ?? [];
      },
      error: err => {
        console.error('Search Error:', err);
        this.transactions = [];
      }
    });
  }

  // =========================================
  // CHART
  // =========================================

  createChart() {

    if (!this.weeklyChartCanvas || this.weeklySummary.length === 0) return;

    const labels = this.weeklySummary.map(w => w.weekStart);
    const incomeData = this.weeklySummary.map(w => w.totalIncome);
    const debitData = this.weeklySummary.map(w => w.totalDebits);

    this.chart = new Chart(this.weeklyChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: '#2ecc71'
          },
          {
            label: 'Debits',
            data: debitData,
            backgroundColor: '#e74c3c'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }
}