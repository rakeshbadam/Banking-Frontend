import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReviewsComponent } from './loan-reviews.component';

describe('LoanReviewsComponent', () => {
  let component: LoanReviewsComponent;
  let fixture: ComponentFixture<LoanReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
