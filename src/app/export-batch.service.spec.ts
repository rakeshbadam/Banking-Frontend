import { TestBed } from '@angular/core/testing';

import { ExportBatchService } from './export-batch.service';

describe('ExportBatchService', () => {
  let service: ExportBatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportBatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
