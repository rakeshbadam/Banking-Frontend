export interface LoanRequest {
  id: number;
  customerId: number;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  processedAt?: string;
  filePath?: string;
}