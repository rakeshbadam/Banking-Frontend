import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsResponse {
  customerId: number;
  metricType: string;
  riskCategory: string | null;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private baseUrl = 'http://18.233.219.222:8080/api/analytics';

  constructor(private http: HttpClient) {}

  getDTI(customerId: number): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(
      `${this.baseUrl}/customer/${customerId}/dti`
    );
  }

  getCreditUtilization(customerId: number): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(
      `${this.baseUrl}/customer/${customerId}/credit-utilization`
    );
  }
}