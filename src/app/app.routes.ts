import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoanReviewsComponent } from './loan-reviews/loan-reviews.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { CustomersComponent } from './customers/customers.component';
import { UploadComponent } from './upload/upload.component';
  

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'loan-reviews', component: LoanReviewsComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'upload', component: UploadComponent },
  { path: '**', redirectTo: '' },
];