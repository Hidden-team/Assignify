import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorSubmission } from './instructor-submission';

describe('InstructorSubmission', () => {
  let component: InstructorSubmission;
  let fixture: ComponentFixture<InstructorSubmission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstructorSubmission]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorSubmission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
