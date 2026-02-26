import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanRequest } from './models/loan-request.model';

@Injectable({
  providedIn: 'root'
})
export class LoanRequestService {

  private baseUrl = 'http://18.233.219.222:8080/api/loan-request';

  constructor(private http: HttpClient) {}

  getByStatus(status: string): Observable<LoanRequest[]> {
    return this.http.get<LoanRequest[]>(`${this.baseUrl}/status/${status}`);
  }
}