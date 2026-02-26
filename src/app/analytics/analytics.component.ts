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
  chart: any;

  private baseUrl = 'http://18.233.219.222:8080/api/analytics/customer';

  constructor(private http: HttpClient) {}

  loadAnalytics() {
    if (!this.customerId) return;

    // Reset
    this.dti = null;
    this.creditUtilization = null;
    this.riskCategory = null;
    this.weeklySummary = [];

    if (this.chart) {
      this.chart.destroy();
    }

    // ✅ DTI
    this.http.get<any>(`${this.baseUrl}/${this.customerId}/dti`)
      .subscribe({
        next: res => {
          this.dti = res.value;
          this.riskCategory = res.riskCategory;
        },
        error: err => console.error('DTI Error:', err)
      });

    // ✅ Credit Utilization
    this.http.get<any>(`${this.baseUrl}/${this.customerId}/credit-utilization`)
      .subscribe({
        next: res => {
          this.creditUtilization = res.value;
        },
        error: err => console.error('CU Error:', err)
      });

    // ✅ Weekly Summary
    this.http.get<any[]>(`${this.baseUrl}/${this.customerId}/weekly-summary`)
      .subscribe({
        next: res => {
          this.weeklySummary = res;

          // Small timeout ensures canvas is rendered
          setTimeout(() => {
            this.createChart();
          }, 100);
        },
        error: err => console.error('Weekly Error:', err)
      });
  }

  createChart() {

    if (!this.weeklyChartCanvas) return;

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